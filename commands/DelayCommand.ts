import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { getUserLanguage, t } from '../lib/i18n';
import { notifyUser } from '../lib/Notifications';
import { IScheduledMessageRecord, ScheduledMessageStore } from '../lib/ScheduledMessageStore';
import { formatDuration, formatWhen, parseTimeSpec } from '../lib/TimeParser';
import { SEND_MESSAGE_PROCESSOR_ID } from '../processors/SendScheduledMessage';

const MAX_DELAY_SETTING_ID = 'max_delay_days';
const DEFAULT_MAX_DELAY_DAYS = 30;

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
            await this.list(read, notify, user, lang);
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
            await notify(t(lang, 'err_no_message'));
            return;
        }
        const sayStart = sayMatch.index + sayMatch[1].length;
        const text = raw.slice(sayStart + 'say'.length).replace(/^\s+/, '');
        if (!text) {
            await notify(t(lang, 'err_say_no_text'));
            return;
        }

        // spec tokens (any order): @mentions + time expression
        const targetUsernames: Array<string> = [];
        const timeTokens: Array<string> = [];
        for (const token of raw.slice(0, sayStart).split(/\s+/).filter(Boolean)) {
            if (token.startsWith('@') && token.length > 1) {
                targetUsernames.push(token.substring(1).replace(/[,]+$/, ''));
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

        const now = new Date();
        const parsed = parseTimeSpec(timeTokens, user.utcOffset, now);
        if (!parsed.ok) {
            await notify(t(lang, parsed.error, { token: parsed.token || '' }));
            return;
        }

        const maxDays = await this.getMaxDelayDays(read);
        const delayMs = parsed.when.getTime() - now.getTime();
        if (delayMs > maxDays * 24 * 60 * 60 * 1000) {
            await notify(t(lang, 'err_too_far', { days: maxDays }));
            return;
        }

        const shortId = this.newShortId();
        const record: IScheduledMessageRecord = {
            shortId,
            jobId: '',
            userId: user.id,
            roomId: room.id,
            targetUsernames,
            text,
            whenIso: parsed.when.toISOString(),
            createdAtIso: now.toISOString(),
            lang,
            utcOffset: user.utcOffset,
        };

        // save first: the processor reads the record back by shortId and a
        // missing record means the message was cancelled
        await ScheduledMessageStore.save(persis, record);

        let jobId: string | void = undefined;
        try {
            jobId = await modify.getScheduler().scheduleOnce({
                id: SEND_MESSAGE_PROCESSOR_ID,
                when: parsed.when,
                data: { shortId },
            });
        } catch (err) {
            this.app.getLogger().error('scheduleOnce failed:', err);
        }
        if (!jobId) {
            await ScheduledMessageStore.removeById(persis, shortId);
            await notify(t(lang, 'err_schedule_failed'));
            return;
        }
        record.jobId = jobId;
        await ScheduledMessageStore.update(persis, record);

        const target = targetUsernames.length
            ? t(lang, 'confirm_target_dm', { users: targetUsernames.map((u) => `@${u}`).join(', ') })
            : t(lang, 'confirm_target_room');
        let confirmation = t(lang, 'confirm_scheduled', {
            id: shortId,
            target,
            when: formatWhen(parsed.when, parsed.usedServerTz ? undefined : user.utcOffset, lang),
            relative: t(lang, 'relative_in', { duration: formatDuration(delayMs) }),
        });
        if (parsed.usedServerTz) {
            confirmation += `\n${t(lang, 'tz_warning')}`;
        }
        await notify(confirmation);
    }

    private async list(read: IRead, notify: (text: string) => Promise<void>, user: IUser, lang: string): Promise<void> {
        const records = await ScheduledMessageStore.listByUser(read.getPersistenceReader(), user.id);
        if (!records.length) {
            await notify(t(lang, 'list_empty'));
            return;
        }
        const lines = records.map((r) => t(lang, 'list_line', {
            id: r.shortId,
            when: formatWhen(new Date(r.whenIso), r.utcOffset, lang),
            target: r.targetUsernames.length
                ? t(lang, 'confirm_target_dm', { users: r.targetUsernames.map((u) => `@${u}`).join(', ') })
                : t(lang, 'confirm_target_room'),
            snippet: (r.text.length > 60 ? `${r.text.substring(0, 57)}...` : r.text).replace(/\s+/g, ' '),
        }));
        await notify(`${t(lang, 'list_header')}\n${lines.join('\n')}`);
    }

    private async cancel(
        read: IRead, modify: IModify, persis: IPersistence,
        notify: (text: string) => Promise<void>,
        user: IUser, lang: string, args: Array<string>,
    ): Promise<void> {
        const target = (args[0] || '').toLowerCase();
        if (!target) {
            await notify(t(lang, 'cancel_usage'));
            return;
        }

        if (target === 'all') {
            const records = await ScheduledMessageStore.listByUser(read.getPersistenceReader(), user.id);
            for (const record of records) {
                await this.cancelRecord(modify, persis, record);
            }
            await notify(t(lang, 'cancel_all_done', { count: records.length }));
            return;
        }

        const record = await ScheduledMessageStore.getById(read.getPersistenceReader(), target);
        if (!record || record.userId !== user.id) {
            await notify(t(lang, 'cancel_not_found', { id: target }));
            return;
        }
        await this.cancelRecord(modify, persis, record);
        await notify(t(lang, 'cancel_done', { id: record.shortId }));
    }

    // removing the record is what makes the cancel stick (the processor
    // refuses to deliver without it), so do that even if cancelJob throws
    private async cancelRecord(modify: IModify, persis: IPersistence, record: IScheduledMessageRecord): Promise<void> {
        try {
            await modify.getScheduler().cancelJob(record.jobId);
        } catch (err) {
            this.app.getLogger().warn(`cancelJob failed for ${record.shortId}, record removed anyway:`, err);
        }
        await ScheduledMessageStore.removeById(persis, record.shortId);
    }

    private async getMaxDelayDays(read: IRead): Promise<number> {
        try {
            const value = await read.getEnvironmentReader().getSettings().getValueById(MAX_DELAY_SETTING_ID);
            const days = Number(value);
            if (Number.isFinite(days) && days >= 1 && days <= 365) {
                return Math.floor(days);
            }
            this.app.getLogger().warn(`Setting ${MAX_DELAY_SETTING_ID} has invalid value "${value}", using default ${DEFAULT_MAX_DELAY_DAYS}`);
        } catch (err) {
            this.app.getLogger().warn(`Could not read setting ${MAX_DELAY_SETTING_ID}:`, err);
        }
        return DEFAULT_MAX_DELAY_DAYS;
    }

    private newShortId(): string {
        const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
        let id = '';
        for (let i = 0; i < 6; i++) {
            id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        }
        return id;
    }
}
