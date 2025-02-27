import type { LobbyData, UserData } from ".";
import type { RoomData } from "../room.type";

export type EventDataMap = {
	broadcast_lobby: LobbyData;
	broadcast_rooms: RoomData[];

	user: UserData | null;
	rooms: RoomData[];
};

export type EventData<T extends keyof EventDataMap = keyof EventDataMap> = {
	type: T;
	payload: EventDataMap[T];
};
