import { randomUUID } from "node:crypto";
import type { RoomDataWithRelations, RoomId, UserData } from "../../types";

export class Room implements RoomDataWithRelations {
	readonly id: `room_${string}`;
	isActive = false;
	name: string;
	readonly createdAt: string | Date;
	readonly owner: UserData;
	_viewers = new Set<UserData["id"]>();
	learningGoal: string;

	public get viewersCount() {
		return this._viewers.size;
	}

	private generateRoomId(): RoomId {
		return `room_${randomUUID()}`;
	}

	constructor(values: {
		learningGoal: string;
		owner: UserData;
		name?: string;
	}) {
		this.learningGoal = values.learningGoal;
		this.owner = values.owner;
		this.name =
			values.name || values.owner.name
				? `${values.owner.name}'s Room`
				: "Unnamed Learning Room";
		this.createdAt = new Date();
		this.id = this.generateRoomId();
	}
}
