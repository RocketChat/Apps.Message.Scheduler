import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IJobContext } from '@rocket.chat/apps-engine/definition/scheduler';
import { App } from '@rocket.chat/apps-engine/definition/App';

import { ScheduledMessageStore } from '../lib/ScheduledMessageStore';
import { rearm } from './SendScheduledMessage';

export const REPAIR_PROCESSOR_ID = 'repair-recurring';

// a job that should already have fired this long ago has lost its chain
const STALE_AFTER_MS = 10 * 60 * 1000;

/**
 * Recurring messages work by arming one job at a time, so a chain broken
 * mid-flight (app disabled while a job fired, a scheduler error) would
 * leave a record that never runs again. This sweep re-arms those records.
 * It only schedules, never delivers, so an extra run cannot double-post.
 */
export function makeRepairRecurringProcessor(app: App) {
    return async (_jobContext: IJobContext, read: IRead, modify: IModify, _http: IHttp, persis: IPersistence): Promise<void> => {
        try {
            const all = await ScheduledMessageStore.listAll(read.getPersistenceReader());
            const cutoff = Date.now() - STALE_AFTER_MS;
            const stale = all.filter((r) => r.recurrence && new Date(r.whenIso).getTime() < cutoff);
            if (!stale.length) {
                return;
            }
            for (const record of stale) {
                const owner = await read.getUserReader().getById(record.userId);
                const repaired = await rearm(app, modify, persis, record, owner ? owner.utcOffset : record.utcOffset, new Date());
                app.getLogger().warn(`Repair sweep ${repaired ? 're-armed' : 'failed to re-arm'} recurring message ${record.shortId}`);
            }
        } catch (err) {
            app.getLogger().error('Recurring repair sweep failed:', err);
        }
    };
}
