import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IRoom, RoomType } from '@rocket.chat/apps-engine/definition/rooms';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { ButtonStyle } from '@rocket.chat/apps-engine/definition/uikit';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { cancelAll, cancelOne, canPostTo, createSchedule, getSiteUrl, linkChannel, linkUsers, listMessages } from '../lib/Actions';
import { getUserLanguage, t } from '../lib/i18n';
import { notifyUser } from '../lib/Notifications';
import { formatDuration, formatRecurrence, formatWhen } from '../lib/TimeParser';

export class DelayCommand implements ISlashCommand {
    public command = 'delay';
    public i18nParamsExample = 'delay_command_params';
    public i18nDescription = 'delay_command_description';
    public providesPreview = false;

    constructor(private readonly app: App) {}

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, _http: IHttp, persis: IPersistence): Promise<void> {
        const user = context.getSender();
        const room = context.getRoom();
        const lang = getUserLanguage(user);
        const args = context.getArguments().filter((a) => a && a.trim().length > 0);

        const notify = (text: string) => notifyUser(this.app, read, modify, user, room, text);

        const sub = (args[0] || 'help').toLowerCase();

        if (args.length === 0 || sub === 'help') {
            await notify(t(lang, 'help_text'));
            return;
        }
        if (sub === 'list') {
            await listMessages(this.app, read, modify, user, room, lang);
            return;
        }
        if (sub === 'cancel') {
            await this.cancel(read, modify, persis, notify, user, lang, args.slice(1));
            return;
        }

        await this.schedule(read, modify, persis, notify, user, room, lang, args);
    }

    private async schedule(
        read: IRead, modify: IModify, persis: IPersistence,
        notify: (text: string) => Promise<void>,
        user: IUser, room: IRoom, lang: string, args: Array<string>,
    ): Promise<void> {
        // split on the "say" keyword against the reconstructed raw string,
        // not exact tokens: tokens can contain embedded newlines (quoted
        // strings, older servers), e.g. "say\nhello" must still match
        const raw = args.join(' ');
        const sayMatch = /(^|\s)say(\s|$)/i.exec(raw);
        if (!sayMatch) {
            await notify(t(lang, 'err_no_message', { cmd: 'delay' }));
            return;
        }
        const sayStart = sayMatch.index + sayMatch[1].length;
        const text = raw.slice(sayStart + 'say'.length).replace(/^\s+/, '');
        if (!text) {
            await notify(t(lang, 'err_say_no_text'));
            return;
        }

        // spec tokens (any order): @mentions + #channels + time expression
        const targetUsernames: Array<string> = [];
        const targetChannelNames: Array<string> = [];
        const timeTokens: Array<string> = [];
        for (const token of raw.slice(0, sayStart).split(/\s+/).filter(Boolean)) {
            if (token.startsWith('@') && token.length > 1) {
                targetUsernames.push(token.substring(1).replace(/[,]+$/, ''));
            } else if (token.startsWith('#') && token.length > 1) {
                targetChannelNames.push(token.substring(1).replace(/[,]+$/, ''));
            } else {
                timeTokens.push(token);
            }
        }

        // validate mentioned users exist before scheduling anything
        for (const username of targetUsernames) {
            const target = await read.getUserReader().getByUsername(username);
            if (!target) {
                await notify(t(lang, 'err_user_not_found', { username }));
                return;
            }
        }

        // validate channels exist and the user is a member: the message is
        // delivered as the user, so they must not reach rooms they cannot access
        const targetChannelIds: Array<string> = [];
        const resolvedChannels: Array<IRoom> = [];
        for (const name of targetChannelNames) {
            const channel = await read.getRoomReader().getByName(name);
            if (!channel || channel.type === RoomType.DIRECT_MESSAGE) {
                await notify(t(lang, 'err_channel_not_found', { name }));
                return;
            }
            if (!(await canPostTo(read, channel, user.id))) {
                await notify(t(lang, 'err_not_channel_member', { name }));
                return;
            }
            targetChannelIds.push(channel.id);
            resolvedChannels.push(channel);
        }

        const result = await createSchedule(this.app, read, modify, persis, user, room, lang, {
            timeTokens, text, targetUsernames, targetChannelIds, kind: 'delay',
        });
        if (!result.ok) {
            await notify(t(lang, result.errorKey, { cmd: 'delay', ...result.errorParams }));
            return;
        }
        const { record, when, delayMs, usedServerTz } = result;
        const shortId = record.shortId;
        const siteUrl = await getSiteUrl(this.app, read);

        const targetParts: Array<string> = [];
        if (resolvedChannels.length) {
            targetParts.push(t(lang, 'confirm_target_channels', {
                channels: resolvedChannels.map((c) => linkChannel(siteUrl, c)).join(', '),
            }));
        }
        if (targetUsernames.length) {
            targetParts.push(t(lang, 'confirm_target_dm', { users: linkUsers(siteUrl, targetUsernames) }));
        }
        const target = targetParts.length ? targetParts.join(' + ') : t(lang, 'confirm_target_room');
        const firstWhen = formatWhen(when, usedServerTz ? undefined : user.utcOffset, lang);
        let confirmation = result.recurrence
            ? t(lang, 'confirm_scheduled_recurring', {
                id: shortId,
                target,
                recurrence: formatRecurrence(result.recurrence, lang),
                next: firstWhen,
            })
            : t(lang, 'confirm_scheduled', {
                id: shortId,
                target,
                when: firstWhen,
                relative: t(lang, 'relative_in', { duration: formatDuration(delayMs) }),
            });
        if (usedServerTz) {
            confirmation += `\n${t(lang, 'tz_warning')}`;
        }

        // action buttons under the confirmation: cancel THIS message without
        // retyping the id, plus discoverable entry points for list and help
        const blocks = modify.getCreator().getBlockBuilder();
        blocks.addSectionBlock({ text: blocks.newMarkdownTextObject(confirmation) });
        blocks.addActionsBlock({
            elements: [
                blocks.newButtonElement({
                    actionId: 'delay-cancel',
                    text: blocks.newPlainTextObject(t(lang, 'btn_cancel')),
                    value: shortId,
                    style: ButtonStyle.DANGER,
                }),
                blocks.newButtonElement({
                    actionId: 'delay-list',
                    text: blocks.newPlainTextObject(t(lang, 'btn_list')),
                }),
                blocks.newButtonElement({
                    actionId: 'delay-help',
                    text: blocks.newPlainTextObject(t(lang, 'btn_help')),
                }),
            ],
        });
        await notifyUser(this.app, read, modify, user, room, confirmation, blocks);
    }

    private async cancel(
        read: IRead, modify: IModify, persis: IPersistence,
        notify: (text: string) => Promise<void>,
        user: IUser, lang: string, args: Array<string>,
    ): Promise<void> {
        const target = (args[0] || '').toLowerCase();
        if (!target) {
            await notify(t(lang, 'cancel_usage', { cmd: 'delay' }));
            return;
        }
        if (target === 'all') {
            await cancelAll(this.app, read, modify, persis, user, lang, notify);
            return;
        }
        await cancelOne(this.app, read, modify, persis, user, lang, target, notify);
    }
}
