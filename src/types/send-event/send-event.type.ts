import type { Connection } from "partyserver";
import type { UserData } from "../event-data";
import type { RoomId, RoomData } from "../room.type";
import type { Room } from "../../server/models/room";
import type { ConstructorOf } from "../constructor-of.type";

export type SendEventMap = {
	rename_user: string;
	ready_user: boolean;
	get_user: never;
	get_lobby: never;
	create_room: ConstructorOf<typeof Room>;
	get_rooms: never;
	join_room: RoomId;
	leave_room: never;
	update_room: Partial<RoomData> & { id: RoomId };
};

export type SendEvent<T extends keyof SendEventMap = keyof SendEventMap> = {
	type: T;
	payload: SendEventMap[T];
	connection: Connection<UserData>;
};

export declare function SendMethod<T extends keyof SendEventMap>(
	type: T,
	...args: SendEventMap[T] extends never ? [] : [payload: SendEventMap[T]]
): void;
