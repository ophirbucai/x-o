import { filter } from "rxjs";
import type { SendEventMap, SendEvent } from "../../types";

export const filterSendEvent = <K extends keyof SendEventMap>(filterKey: K) =>
	filter((evt: SendEvent): evt is SendEvent<K> => evt.type === filterKey);
