import { IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IRoom, RoomType } from '@rocket.chat/apps-engine/definition/rooms';
import { ButtonStyle } from '@rocket.chat/apps-engine/definition/uikit';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { t } from './i18n';
import { notifyUser } from './Notifications';
import { IScheduledMessageRecord, ScheduledMessageStore } from './ScheduledMessageStore';
import { formatWhen, parseTimeSpec } from './TimeParser';

export type Notify = (text: string) => Promise<void>;

const SEND_MESSAGE_PROCESSOR_ID = 'scheduled-message';
const MAX_DELAY_SETTING_ID = 'max_delay_days';
const DEFAULT_MAX_DELAY_DAYS = 30;

export interface IScheduleRequest {
    timeTokens: Array<string>;
    text: string;
    targetUsernames: Array<string>;
    targetChannelIds: Array<string>;
    kind: 'delay' | 'remind';
}

export type ScheduleResult =
    | { ok: true; record: IScheduledMessageRecord; when: Date; delayMs: number; usedServerTz: boolean }
    | { ok: false; errorKey: string; errorParams?: Record<string, string | number> };

/**
 * Shared scheduling core for /delay and /remind: parse the time, enforce
 * the admin delay cap, persist the record, register the scheduler job.
 * Save happens before scheduling: the processor reads the record back by
 * shortId and treats a missing record as cancelled.
 */
export async function createSchedule(
    app: App, read: IRead, modify: IModify, persis: IPersistence,
    user: IUser, room: IRoom, lang: string, req: IScheduleRequest,
): Promise<ScheduleResult> {
    const now = new Date();
    const parsed = parseTimeSpec(req.timeTokens, user.utcOffset, now);
    if (!parsed.ok) {
        return { ok: false, errorKey: parsed.error, errorParams: { token: parsed.token || '' } };
    }

    const maxDays = await getMaxDelayDays(app, read);
    const delayMs = parsed.when.getTime() - now.getTime();
    if (delayMs > maxDays * 24 * 60 * 60 * 1000) {
        return { ok: false, errorKey: 'err_too_far', errorParams: { days: maxDays } };
    }

    const record: IScheduledMessageRecord = {
        shortId: newShortId(),
        jobId: '',
        userId: user.id,
        roomId: room.id,
        targetUsernames: req.targetUsernames,
        targetChannelIds: req.targetChannelIds,
        kind: req.kind,
        text: req.text,
        whenIso: parsed.when.toISOString(),
        createdAtIso: now.toISOString(),
        lang,
        utcOffset: user.utcOffset,
    };
    await ScheduledMessageStore.save(persis, record);

    let jobId: string | void = undefined;
    try {
        jobId = await modify.getScheduler().scheduleOnce({
            id: SEND_MESSAGE_PROCESSOR_ID,
            when: parsed.when,
            data: { shortId: record.shortId },
        });
    } catch (err) {
        app.getLogger().error('scheduleOnce failed:', err);
    }
    if (!jobId) {
        await ScheduledMessageStore.removeById(persis, record.shortId);
        return { ok: false, errorKey: 'err_schedule_failed' };
    }
    record.jobId = jobId;
    await ScheduledMessageStore.update(persis, record);

    return { ok: true, record, when: parsed.when, delayMs, usedServerTz: parsed.usedServerTz };
}

export async function getMaxDelayDays(app: App, read: IRead): Promise<number> {
    try {
        const value = await read.getEnvironmentReader().getSettings().getValueById(MAX_DELAY_SETTING_ID);
        const days = Number(value);
        if (Number.isFinite(days) && days >= 1 && days <= 365) {
            return Math.floor(days);
        }
        app.getLogger().warn(`Setting ${MAX_DELAY_SETTING_ID} has invalid value "${value}", using default ${DEFAULT_MAX_DELAY_DAYS}`);
    } catch (err) {
        app.getLogger().warn(`Could not read setting ${MAX_DELAY_SETTING_ID}:`, err);
    }
    return DEFAULT_MAX_DELAY_DAYS;
}

function newShortId(): string {
    const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
        id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return id;
}

const DEFAULT_SNIPPET_CAP = 80;

export async function getSnippetCap(app: App, read: IRead): Promise<number> {
    try {
        const value = await read.getEnvironmentReader().getSettings().getValueById('list_snippet_length');
        const chars = Number(value);
        if (Number.isFinite(chars) && chars >= 20 && chars <= 500) {
            return Math.floor(chars);
        }
        app.getLogger().warn(`Setting list_snippet_length has invalid value "${value}", using default ${DEFAULT_SNIPPET_CAP}`);
    } catch (err) {
        app.getLogger().warn('Could not read setting list_snippet_length:', err);
    }
    return DEFAULT_SNIPPET_CAP;
}

export async function getSiteUrl(app: App, read: IRead): Promise<string> {
    try {
        const url = await read.getEnvironmentReader().getServerSettings().getValueById('Site_Url');
        return typeof url === 'string' ? url.replace(/\/+$/, '') : '';
    } catch (err) {
        app.getLogger().warn('Could not read Site_Url, target links disabled:', err);
        return '';
    }
}

// ephemeral notifications never get server-side mention parsing, so
// markdown links are the only way to make targets clickable there
export function linkUsers(siteUrl: string, usernames: Array<string>): string {
    return usernames
        .map((u) => siteUrl ? `[@${u}](${siteUrl}/direct/${u})` : `@${u}`)
        .join(', ');
}

export function linkChannel(siteUrl: string, room: IRoom): string {
    const name = room.displayName || room.slugifiedName;
    return siteUrl ? `[#${name}](${siteUrl}/channel/${room.slugifiedName})` : `#${name}`;
}

// names the destination from anywhere, not just the room the command
// was typed in: #channels, @mention targets, or the room it was scheduled in
export async function describeTarget(
    read: IRead, record: IScheduledMessageRecord, user: IUser, lang: string, siteUrl: string,
): Promise<string> {
    if (record.kind === 'remind') {
        return t(lang, 'confirm_target_reminder');
    }
    const parts: Array<string> = [];
    if (record.targetChannelIds && record.targetChannelIds.length) {
        const labels: Array<string> = [];
        for (const channelId of record.targetChannelIds) {
            const channel = await read.getRoomReader().getById(channelId);
            labels.push(channel ? linkChannel(siteUrl, channel) : t(lang, 'list_target_gone'));
        }
        parts.push(t(lang, 'confirm_target_channels', { channels: labels.join(', ') }));
    }
    if (record.targetUsernames.length) {
        parts.push(t(lang, 'confirm_target_dm', { users: linkUsers(siteUrl, record.targetUsernames) }));
    }
    if (parts.length) {
        return parts.join(' + ');
    }
    const room = await read.getRoomReader().getById(record.roomId);
    if (!room) {
        return t(lang, 'list_target_gone');
    }
    if (room.type === RoomType.DIRECT_MESSAGE) {
        const members = await read.getRoomReader().getMembers(record.roomId);
        const others = members.filter((m) => m.username !== user.username).map((m) => m.username);
        return t(lang, 'list_target_dm_room', { users: linkUsers(siteUrl, others.length ? others : [user.username]) });
    }
    return t(lang, 'list_target_channel', { name: linkChannel(siteUrl, room) });
}

export async function listMessages(app: App, read: IRead, modify: IModify, user: IUser, room: IRoom, lang: string, prefix?: string, kind?: 'delay' | 'remind'): Promise<void> {
    const all = await ScheduledMessageStore.listByUser(read.getPersistenceReader(), user.id);
    const records = kind ? all.filter((r) => (r.kind || 'delay') === kind) : all;
    if (!records.length) {
        const empty = t(lang, 'list_empty');
        await notifyUser(app, read, modify, user, room, prefix ? `${prefix}\n${empty}` : empty);
        return;
    }
    const siteUrl = await getSiteUrl(app, read);
    const snippetCap = await getSnippetCap(app, read);
    const collapsed = records.map((r) => r.text.replace(/\s+/g, ' '));
    const truncated = collapsed.map((s) => s.length > snippetCap);
    const snippets = collapsed.map((s, i) => truncated[i] ? `${s.substring(0, snippetCap - 3)}...` : s);
    const heads = await Promise.all(records.map(async (r) => t(lang, 'list_line_head', {
        id: r.shortId,
        when: formatWhen(new Date(r.whenIso), r.utcOffset, lang),
        target: await describeTarget(read, r, user, lang, siteUrl),
    })));

    // per record: metadata row with its Cancel button, snippet row with a
    // Show button when truncated (block text is grid-width-capped, so the
    // Show action reposts the full text as a plain full-width message)
    const blocks = modify.getCreator().getBlockBuilder();
    if (prefix) {
        blocks.addSectionBlock({ text: blocks.newMarkdownTextObject(prefix) });
    }
    blocks.addSectionBlock({ text: blocks.newMarkdownTextObject(t(lang, 'list_header')) });
    records.forEach((r, i) => {
        blocks.addSectionBlock({
            text: blocks.newMarkdownTextObject(heads[i]),
            accessory: blocks.newButtonElement({
                actionId: 'delay-cancel',
                text: blocks.newPlainTextObject(t(lang, 'btn_cancel')),
                value: r.shortId,
                style: ButtonStyle.DANGER,
            }),
        });
        blocks.addSectionBlock({
            text: blocks.newMarkdownTextObject(`_"${snippets[i]}"_`),
            ...(truncated[i] && {
                accessory: blocks.newButtonElement({
                    actionId: 'delay-show',
                    text: blocks.newPlainTextObject(t(lang, 'btn_show')),
                    value: r.shortId,
                }),
            }),
        });
    });
    const fallback = records.map((r, i) => `• ${heads[i]}: "${snippets[i]}"`).join('\n');
    const fallbackText = `${prefix ? `${prefix}\n` : ''}${t(lang, 'list_header')}\n${fallback}`;
    await notifyUser(app, read, modify, user, room, fallbackText, blocks);
}

/**
 * Show button on a truncated list row: repost the full message text as a
 * plain (blocks-free) ephemeral, which is the only full-width surface.
 */
export async function showFullMessage(
    app: App, read: IRead, modify: IModify,
    user: IUser, room: IRoom, lang: string, shortId: string,
): Promise<void> {
    const record = await ScheduledMessageStore.getById(read.getPersistenceReader(), shortId);
    if (!record || record.userId !== user.id) {
        await notifyUser(app, read, modify, user, room, t(lang, 'cancel_not_found', { id: shortId }));
        return;
    }
    const siteUrl = await getSiteUrl(app, read);
    const head = t(lang, 'list_line_head', {
        id: record.shortId,
        when: formatWhen(new Date(record.whenIso), record.utcOffset, lang),
        target: await describeTarget(read, record, user, lang, siteUrl),
    });
    // full-width text only: adding blocks would suppress the text body,
    // and the record's Cancel button already sits in the list message above
    const quoted = record.text.split('\n').map((l) => `> ${l}`).join('\n');
    await notifyUser(app, read, modify, user, room, `${head}\n${quoted}`);
}

/**
 * Cancel triggered from a button: since the ephemeral list cannot be
 * updated in place, respond with the cancellation and the refreshed
 * list in a single new ephemeral.
 */
export async function cancelFromButton(
    app: App, read: IRead, modify: IModify, persis: IPersistence,
    user: IUser, room: IRoom, lang: string, shortId: string,
): Promise<void> {
    const record = await ScheduledMessageStore.getById(read.getPersistenceReader(), shortId);
    if (!record || record.userId !== user.id) {
        await notifyUser(app, read, modify, user, room, t(lang, 'cancel_not_found', { id: shortId }));
        return;
    }
    await cancelRecord(app, modify, persis, record);
    await listMessages(app, read, modify, user, room, lang, t(lang, 'cancel_done', { id: record.shortId }));
}

// removing the record is what makes the cancel stick (the processor
// refuses to deliver without it), so do that even if cancelJob throws
export async function cancelRecord(app: App, modify: IModify, persis: IPersistence, record: IScheduledMessageRecord): Promise<void> {
    try {
        await modify.getScheduler().cancelJob(record.jobId);
    } catch (err) {
        app.getLogger().warn(`cancelJob failed for ${record.shortId}, record removed anyway:`, err);
    }
    await ScheduledMessageStore.removeById(persis, record.shortId);
}

export async function cancelOne(
    app: App, read: IRead, modify: IModify, persis: IPersistence,
    user: IUser, lang: string, shortId: string, notify: Notify,
): Promise<void> {
    const record = await ScheduledMessageStore.getById(read.getPersistenceReader(), shortId);
    if (!record || record.userId !== user.id) {
        await notify(t(lang, 'cancel_not_found', { id: shortId }));
        return;
    }
    await cancelRecord(app, modify, persis, record);
    await notify(t(lang, 'cancel_done', { id: record.shortId }));
}

export async function cancelAll(
    app: App, read: IRead, modify: IModify, persis: IPersistence,
    user: IUser, lang: string, notify: Notify, kind?: 'delay' | 'remind',
): Promise<void> {
    const all = await ScheduledMessageStore.listByUser(read.getPersistenceReader(), user.id);
    const records = kind ? all.filter((r) => (r.kind || 'delay') === kind) : all;
    for (const record of records) {
        await cancelRecord(app, modify, persis, record);
    }
    await notify(t(lang, 'cancel_all_done', { count: records.length }));
}
