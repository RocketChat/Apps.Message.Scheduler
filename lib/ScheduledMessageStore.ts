import { IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';

import { IRecurrence } from './TimeParser';

export interface IScheduledMessageRecord {
    shortId: string;
    jobId: string;
    userId: string;
    roomId: string;           // room the command was typed in (delivery target when no explicit targets)
    targetUsernames: Array<string>; // deliver as a DM to each
    targetChannelIds?: Array<string>; // deliver to each channel (optional: predates v0.0.14 records)
    kind?: 'delay' | 'remind'; // remind = bot DMs the scheduling user (optional: predates v0.0.32 records)
    recurrence?: IRecurrence; // present = repeats; whenIso is the NEXT occurrence (optional: predates v0.0.35)
    occurrenceCount?: number; // deliveries so far, recurring only (optional: predates v0.0.35)
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

    /** Every record in the workspace: used only by the recurring repair sweep. */
    public static async listAll(persisRead: IPersistenceRead): Promise<Array<IScheduledMessageRecord>> {
        const results = await persisRead.readByAssociations([ALL]);
        return results as Array<IScheduledMessageRecord>;
    }

    /**
     * The server matches update queries on the WHOLE associations array, not
     * a subset the way reads and removes do, so this must pass exactly the
     * three associations used at save time or the write silently does
     * nothing. upsert is false so a concurrently cancelled record cannot be
     * resurrected by a late re-arm.
     */
    public static async update(persis: IPersistence, record: IScheduledMessageRecord): Promise<void> {
        await persis.updateByAssociations([ALL, byId(record.shortId), byUser(record.userId)], record, false);
    }

    public static async removeById(persis: IPersistence, shortId: string): Promise<void> {
        await persis.removeByAssociations([ALL, byId(shortId)]);
    }
}
