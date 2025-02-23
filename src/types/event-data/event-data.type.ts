import type { LobbyData, UserData } from ".";

export type EventDataMap = {
	lobby: LobbyData;
	user: UserData | null;
};

export type EventData<T extends keyof EventDataMap = keyof EventDataMap> = {
	type: T;
	payload: EventDataMap[T];
};
