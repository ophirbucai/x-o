import type { LobbyData } from "./lobby-data.type";

export type EventDataMap = {
	lobby: LobbyData;
};

export type EventData<T extends keyof EventDataMap = keyof EventDataMap> = {
	type: T;
	payload: EventDataMap[T];
};
