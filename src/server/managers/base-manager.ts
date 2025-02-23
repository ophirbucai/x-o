import type { ManagerDeps } from "../../types";

export abstract class BaseManager {
	constructor(protected readonly deps: ManagerDeps) {
		this.setupSubscriptions();
	}

	protected abstract setupSubscriptions(): void;
}
