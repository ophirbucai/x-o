import { filter } from "rxjs";
import type { SendEventMap, SendEvent } from "../../types";

export const filterSendEvent = <K extends keyof SendEventMap>(
	...filterKeys: K[]
) =>
	filter((evt: SendEvent): evt is SendEvent<K> =>
		filterKeys.includes(evt.type as K),
	);
