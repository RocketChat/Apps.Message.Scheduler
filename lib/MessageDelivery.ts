import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom, RoomType } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

/**
 * Returns the DM room between the two users, creating it if it does not
 * exist yet.
 */
export async function getOrCreateDirectRoom(read: IRead, modify: IModify, sender: IUser, targetUsername: string): Promise<IRoom> {
    const usernames = [sender.username, targetUsername];
    try {
        const existing = await read.getRoomReader().getDirectByUsernames(usernames);
        if (existing) {
            return existing;
        }
    } catch {
        // fall through and create
    }

    const builder = modify.getCreator().startRoom()
        .setType(RoomType.DIRECT_MESSAGE)
        .setCreator(sender)
        .setMembersToBeAddedByUsernames(usernames);
    const roomId = await modify.getCreator().finish(builder);
    const room = await read.getRoomReader().getById(roomId);
    if (!room) {
        throw new Error(`Could not create direct room with ${targetUsername}`);
    }
    return room;
}

export async function sendAsUser(modify: IModify, sender: IUser, room: IRoom, text: string): Promise<void> {
    const builder = modify.getCreator().startMessage()
        .setSender(sender)
        .setRoom(room)
        .setText(text);
    await modify.getCreator().finish(builder);
}
