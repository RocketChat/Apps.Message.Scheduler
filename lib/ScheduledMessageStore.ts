import { IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';

export interface IScheduledMessageRecord {
    shortId: string;
    jobId: string;
    userId: string;
    roomId: string;           // room the command was typed in (delivery target when no mentions)
    targetUsernames: Array<string>; // non-empty => deliver as DM to each
    text: string;
    whenIso: string;
    createdAtIso: string;
    lang: string;
    utcOffset?: number;
}

const ALL = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'scheduled-message-record');

const byId = (shortId: string) =>
    new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, `sched:${shortId}`);

const byUser = (userId: string) =>
    new RocketChatAssociationRecord(RocketChatAssociationModel.USER, userId);

export class ScheduledMessageStore {
    public static async save(persis: IPersistence, record: IScheduledMessageRecord): Promise<void> {
        await persis.createWithAssociations(record, [ALL, byId(record.shortId), byUser(record.userId)]);
    }

    public static async getById(persisRead: IPersistenceRead, shortId: string): Promise<IScheduledMessageRecord | undefined> {
        const results = await persisRead.readByAssociations([ALL, byId(shortId)]);
        return results.length ? results[0] as IScheduledMessageRecord : undefined;
    }

    public static async listByUser(persisRead: IPersistenceRead, userId: string): Promise<Array<IScheduledMessageRecord>> {
        const results = await persisRead.readByAssociations([ALL, byUser(userId)]);
        return (results as Array<IScheduledMessageRecord>)
            .slice()
            .sort((a, b) => a.whenIso.localeCompare(b.whenIso));
    }

    public static async update(persis: IPersistence, record: IScheduledMessageRecord): Promise<void> {
        await persis.updateByAssociations([ALL, byId(record.shortId)], record);
    }

    public static async removeById(persis: IPersistence, shortId: string): Promise<void> {
        await persis.removeByAssociations([ALL, byId(shortId)]);
    }
}
