import { filter } from "rxjs";
import type { EventDataMap, EventData } from "../../types";

export const filterEventData = <K extends keyof EventDataMap>(
	...filterKeys: K[]
) =>
	filter((evt: EventData): evt is EventData<K> =>
		filterKeys.includes(evt.type as K),
	);
