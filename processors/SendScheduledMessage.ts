import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IJobContext } from '@rocket.chat/apps-engine/definition/scheduler';
import { App } from '@rocket.chat/apps-engine/definition/App';

import { getOrCreateDirectRoom, sendAsUser } from '../lib/MessageDelivery';
import { ScheduledMessageStore } from '../lib/ScheduledMessageStore';

export const SEND_MESSAGE_PROCESSOR_ID = 'scheduled-message';

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

            if (record.targetUsernames && record.targetUsernames.length > 0) {
                for (const username of record.targetUsernames) {
                    const room = await getOrCreateDirectRoom(read, modify, sender, username);
                    await sendAsUser(modify, sender, room, record.text);
                }
            } else {
                const room = await read.getRoomReader().getById(record.roomId);
                if (!room) {
                    throw new Error(`Room ${record.roomId} no longer exists`);
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
