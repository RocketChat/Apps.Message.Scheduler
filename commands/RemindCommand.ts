import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { ButtonStyle } from '@rocket.chat/apps-engine/definition/uikit';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { cancelAll, cancelOne, createSchedule, listMessages } from '../lib/Actions';
import { getUserLanguage, t } from '../lib/i18n';
import { notifyUser } from '../lib/Notifications';
import { formatDuration, formatWhen } from '../lib/TimeParser';

/**
 * Personal reminders: same parser and scheduler as /delay, but the target
 * is fixed to the scheduling user and delivery comes FROM the app bot in
 * the bot DM. Sending as the user into a self-DM would never notify them
 * (own messages do not ping), so the bot identity is deliberate here.
 */
export class RemindCommand implements ISlashCommand {
    public command = 'remind';
    public i18nParamsExample = 'remind_command_params';
    public i18nDescription = 'remind_command_description';
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
            await notify(t(lang, 'remind_help_text'));
            return;
        }
        if (sub === 'list') {
            await listMessages(this.app, read, modify, user, room, lang, undefined, 'remind');
            return;
        }
        if (sub === 'cancel') {
            const target = (args[1] || '').toLowerCase();
            if (!target) {
                await notify(t(lang, 'cancel_usage', { cmd: 'remind' }));
                return;
            }
            if (target === 'all') {
                await cancelAll(this.app, read, modify, persis, user, lang, notify, 'remind');
                return;
            }
            await cancelOne(this.app, read, modify, persis, user, lang, target, notify);
            return;
        }

        await this.schedule(read, modify, persis, notify, user, room, lang, args);
    }

    private async schedule(
        read: IRead, modify: IModify, persis: IPersistence,
        notify: (text: string) => Promise<void>,
        user: IUser, room: IRoom, lang: string, args: Array<string>,
    ): Promise<void> {
        const raw = args.join(' ');
        const sayMatch = /(^|\s)say(\s|$)/i.exec(raw);
        if (!sayMatch) {
            await notify(t(lang, 'err_no_message', { cmd: 'remind' }));
            return;
        }
        const sayStart = sayMatch.index + sayMatch[1].length;
        const text = raw.slice(sayStart + 'say'.length).replace(/^\s+/, '');
        if (!text) {
            await notify(t(lang, 'err_say_no_text'));
            return;
        }
        const timeTokens = raw.slice(0, sayStart).split(/\s+/).filter(Boolean);

        const result = await createSchedule(this.app, read, modify, persis, user, room, lang, {
            timeTokens, text, targetUsernames: [], targetChannelIds: [], kind: 'remind',
        });
        if (!result.ok) {
            await notify(t(lang, result.errorKey, { cmd: 'remind', ...result.errorParams }));
            return;
        }

        let confirmation = t(lang, 'confirm_scheduled', {
            id: result.record.shortId,
            target: t(lang, 'confirm_target_reminder'),
            when: formatWhen(result.when, result.usedServerTz ? undefined : user.utcOffset, lang),
            relative: t(lang, 'relative_in', { duration: formatDuration(result.delayMs) }),
        });
        if (result.usedServerTz) {
            confirmation += `\n${t(lang, 'tz_warning')}`;
        }

        const blocks = modify.getCreator().getBlockBuilder();
        blocks.addSectionBlock({ text: blocks.newMarkdownTextObject(confirmation) });
        blocks.addActionsBlock({
            elements: [
                blocks.newButtonElement({
                    actionId: 'delay-cancel',
                    text: blocks.newPlainTextObject(t(lang, 'btn_cancel')),
                    value: result.record.shortId,
                    style: ButtonStyle.DANGER,
                }),
                blocks.newButtonElement({
                    actionId: 'delay-list',
                    text: blocks.newPlainTextObject(t(lang, 'btn_list')),
                }),
            ],
        });
        await notifyUser(this.app, read, modify, user, room, confirmation, blocks);
    }
}
