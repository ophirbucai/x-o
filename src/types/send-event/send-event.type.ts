import type { Connection } from "partyserver";
import type { UserData } from "../event-data";

export type SendEventMap = {
	rename_user: string;
	ready_user: boolean;
	get_user: never;
	get_lobby: never;
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
