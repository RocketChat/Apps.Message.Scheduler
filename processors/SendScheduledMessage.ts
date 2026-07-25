import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IJobContext } from '@rocket.chat/apps-engine/definition/scheduler';
import { App } from '@rocket.chat/apps-engine/definition/App';

import { IRoom, RoomType } from '@rocket.chat/apps-engine/definition/rooms';

import { t } from '../lib/i18n';
import { getOrCreateDirectRoom, sendAsUser } from '../lib/MessageDelivery';
import { ScheduledMessageStore } from '../lib/ScheduledMessageStore';

export const SEND_MESSAGE_PROCESSOR_ID = 'scheduled-message';

async function isMember(read: IRead, roomId: string, userId: string): Promise<boolean> {
    const members = await read.getRoomReader().getMembers(roomId);
    return members.some((m) => m.id === userId);
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

        try {
            const sender = await read.getUserReader().getById(record.userId);
            if (!sender) {
                throw new Error(`Sender ${record.userId} no longer exists`);
            }

            // reminders are delivered BY the app bot into the bot DM: a
            // message sent as the user to themselves would never notify them
            if (record.kind === 'remind') {
                const appUser = await read.getUserReader().getAppUser(app.getID());
                if (!appUser) {
                    throw new Error('App user not found for reminder delivery');
                }
                const dm = await getOrCreateDirectRoom(read, modify, appUser, sender.username);
                await sendAsUser(modify, appUser, dm, t(record.lang, 'remind_delivery', { text: record.text }));
                return;
            }

            const channelIds = record.targetChannelIds || [];
            const usernames = record.targetUsernames || [];

            // membership was validated at schedule time, but up to the full
            // delay can pass before the job fires: re-check at delivery so a
            // user who left or was removed cannot still post into the room
            if (channelIds.length || usernames.length) {
                for (const channelId of channelIds) {
                    const channel = await read.getRoomReader().getById(channelId);
                    if (!channel) {
                        app.getLogger().warn(`Channel ${channelId} for scheduled message ${shortId} no longer exists, skipping`);
                        continue;
                    }
                    if (!(await isMember(read, channel.id, sender.id))) {
                        app.getLogger().warn(`Sender is no longer a member of ${channel.slugifiedName}, skipping scheduled message ${shortId} for that channel`);
                        continue;
                    }
                    await sendAsUser(modify, sender, channel, record.text);
                }
                for (const username of usernames) {
                    const room = await getOrCreateDirectRoom(read, modify, sender, username);
                    await sendAsUser(modify, sender, room, record.text);
                }
            } else {
                const room = await read.getRoomReader().getById(record.roomId);
                if (!room) {
                    throw new Error(`Room ${record.roomId} no longer exists`);
                }
                if (room.type !== RoomType.DIRECT_MESSAGE && !(await isMember(read, room.id, sender.id))) {
                    app.getLogger().warn(`Sender is no longer a member of ${room.slugifiedName}, dropping scheduled message ${shortId}`);
                    return;
                }
                await sendAsUser(modify, sender, room, record.text);
            }
        } catch (err) {
            app.getLogger().error(`Failed to deliver scheduled message ${shortId}:`, err);
        } finally {
            // the job fired; the record is spent either way
            await ScheduledMessageStore.removeById(persis, shortId);
        }
    };
}
