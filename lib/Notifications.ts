import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

/**
 * Sends an ephemeral notification, visible only to the given user,
 * sent by the app user (official-app convention).
 */
export async function notifyUser(app: App, read: IRead, modify: IModify, user: IUser, room: IRoom, text: string): Promise<void> {
    const appUser = await read.getUserReader().getAppUser(app.getID());
    const message = modify.getCreator().startMessage()
        .setSender(appUser || user)
        .setRoom(room)
        .setText(text)
        .setGroupable(false);
    await read.getNotifier().notifyUser(user, message.getMessage());
}
