import type { Connection } from "partyserver";
import type { Env } from "./env.type";
import type { Observable } from "rxjs";
import type { SendEvent } from "./send-event";
import type { EventDataMap, UserData } from "./event-data";

export type ManagerDeps = {
	env: Env;
	messages$: Observable<SendEvent>;
	send: <T extends keyof EventDataMap>(
		type: T,
		payload: EventDataMap[T],
		...conn: T extends `broadcast_${string}` ? [] : [Connection<UserData>]
	) => void;
};
