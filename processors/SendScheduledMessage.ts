import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IJobContext } from '@rocket.chat/apps-engine/definition/scheduler';
import { App } from '@rocket.chat/apps-engine/definition/App';

import { RoomType } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { canPostTo } from '../lib/Actions';
import { t } from '../lib/i18n';
import { getOrCreateDirectRoom, sendAsUser } from '../lib/MessageDelivery';
import { IScheduledMessageRecord, ScheduledMessageStore } from '../lib/ScheduledMessageStore';
import { nextOccurrence } from '../lib/TimeParser';

export const SEND_MESSAGE_PROCESSOR_ID = 'scheduled-message';

interface IDeliveryOutcome {
    /** a target is gone or the sender lost access to it */
    unreachable?: string;
}

async function deliver(
    app: App, read: IRead, modify: IModify,
    record: IScheduledMessageRecord, sender: IUser,
): Promise<IDeliveryOutcome> {
    // reminders are delivered BY the app bot into the bot DM: a
    // message sent as the user to themselves would never notify them
    if (record.kind === 'remind') {
        const appUser = await read.getUserReader().getAppUser(app.getID());
        if (!appUser) {
            throw new Error('App user not found for reminder delivery');
        }
        const dm = await getOrCreateDirectRoom(read, modify, appUser, sender.username);
        await sendAsUser(modify, appUser, dm, t(record.lang, 'remind_delivery', { text: record.text }));
        return {};
    }

    const channelIds = record.targetChannelIds || [];
    const usernames = record.targetUsernames || [];

    // membership was validated at schedule time, but time passes before the
    // job fires: re-check at delivery so a user who left or was removed
    // cannot still post into the room
    if (channelIds.length || usernames.length) {
        let unreachable: string | undefined;
        for (const channelId of channelIds) {
            const channel = await read.getRoomReader().getById(channelId);
            if (!channel) {
                app.getLogger().warn(`Channel ${channelId} for scheduled message ${record.shortId} no longer exists, skipping`);
                unreachable = channelId;
                continue;
            }
            if (!(await canPostTo(read, channel, sender.id))) {
                app.getLogger().warn(`Sender can no longer post in ${channel.slugifiedName}, skipping ${record.shortId} for that channel`);
                unreachable = `#${channel.displayName || channel.slugifiedName}`;
                continue;
            }
            await sendAsUser(modify, sender, channel, record.text);
        }
        for (const username of usernames) {
            const room = await getOrCreateDirectRoom(read, modify, sender, username);
            await sendAsUser(modify, sender, room, record.text);
        }
        return { unreachable };
    }

    const room = await read.getRoomReader().getById(record.roomId);
    if (!room) {
        throw new Error(`Room ${record.roomId} no longer exists`);
    }
    if (!(await canPostTo(read, room, sender.id))) {
        app.getLogger().warn(`Sender can no longer post in ${room.slugifiedName}, dropping ${record.shortId}`);
        return { unreachable: `#${room.displayName || room.slugifiedName}` };
    }
    await sendAsUser(modify, sender, room, record.text);
    return {};
}

/**
 * Arms the next occurrence of a recurring record in place. The offset is
 * read from the live user rather than the record so a series follows the
 * user's timezone after a DST change.
 */
export async function rearm(
    app: App, modify: IModify, persis: IPersistence,
    record: IScheduledMessageRecord, utcOffset: number | undefined, after: Date,
): Promise<boolean> {
    if (!record.recurrence) {
        return false;
    }
    const when = nextOccurrence(record.recurrence, after, utcOffset);
    let jobId: string | void = undefined;
    try {
        jobId = await modify.getScheduler().scheduleOnce({
            id: SEND_MESSAGE_PROCESSOR_ID,
            when,
            data: { shortId: record.shortId },
        });
    } catch (err) {
        app.getLogger().error(`Failed to re-arm recurring message ${record.shortId}:`, err);
    }
    if (!jobId) {
        // leave the record alone: the repair sweep re-arms it later
        return false;
    }
    record.jobId = jobId;
    record.whenIso = when.toISOString();
    record.utcOffset = utcOffset;
    await ScheduledMessageStore.update(persis, record);
    return true;
}

export function makeSendScheduledMessageProcessor(app: App) {
    return async (jobContext: IJobContext, read: IRead, modify: IModify, _http: IHttp, persis: IPersistence): Promise<void> => {
        const { shortId } = jobContext as { shortId?: string };
        if (!shortId) {
            app.getLogger().error('Scheduled job fired without a shortId in its context');
            return;
        }

        // the persistence record is the source of truth: if it is gone,
        // the message was cancelled and this job must not deliver
        const record = await ScheduledMessageStore.getById(read.getPersistenceReader(), shortId);
        if (!record) {
            app.getLogger().debug(`Scheduled message ${shortId} has no record, treating as cancelled`);
            return;
        }

        let sender: IUser | undefined;
        let outcome: IDeliveryOutcome = {};
        try {
            sender = await read.getUserReader().getById(record.userId);
            if (!sender) {
                throw new Error(`Sender ${record.userId} no longer exists`);
            }
            outcome = await deliver(app, read, modify, record, sender);
        } catch (err) {
            app.getLogger().error(`Failed to deliver scheduled message ${shortId}:`, err);
        }

        // one-shot messages are spent once they fire, however they went
        if (!record.recurrence) {
            await ScheduledMessageStore.removeById(persis, shortId);
            return;
        }

        // losing access to a target ends the series, and the owner is told
        if (outcome.unreachable) {
            await ScheduledMessageStore.removeById(persis, shortId);
            try {
                const appUser = await read.getUserReader().getAppUser(app.getID());
                if (appUser && sender) {
                    const dm = await getOrCreateDirectRoom(read, modify, appUser, sender.username);
                    await sendAsUser(modify, appUser, dm, t(record.lang, 'recur_cancelled_access', {
                        id: record.shortId,
                        target: outcome.unreachable,
                    }));
                }
            } catch (err) {
                app.getLogger().error(`Could not notify owner about cancelled series ${shortId}:`, err);
            }
            return;
        }

        record.occurrenceCount = (record.occurrenceCount || 0) + 1;
        // never re-arm behind the occurrence just handled, so the series
        // always moves forward even if the job ran a moment early
        const after = new Date(Math.max(Date.now(), new Date(record.whenIso).getTime()));
        await rearm(app, modify, persis, record, sender ? sender.utcOffset : record.utcOffset, after);
    };
}
