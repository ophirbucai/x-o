import type { UserData } from "./_user-data.type";

export type LobbyData = {
	idle: UserData[];
	ready: UserData[];
	total: number;
};
