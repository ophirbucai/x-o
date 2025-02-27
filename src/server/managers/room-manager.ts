import { BaseManager } from "./base-manager";
import { Room } from "../models/room";
import { filterSendEvent } from "../utils/filter-send-event";
import type { RoomData, RoomId, SendEvent } from "../../types";

export class RoomManager extends BaseManager {
	private _rooms = new Map<RoomId, RoomData>();

	protected setupSubscriptions(): void {
		const subject = this.deps.messages$;

		subject
			.pipe(filterSendEvent("create_room"))
			.subscribe(this.createRoom.bind(this));

		subject
			.pipe(filterSendEvent("get_rooms"))
			.subscribe(this.getRooms.bind(this));
	}

	createRoom({ payload }: SendEvent<"create_room">) {
		const room = new Room(payload);

		this._rooms.set(room.id, room);
	}

	getRooms({ connection }: SendEvent<"get_rooms">): void {
		const activeRooms = this.getActiveRooms();

		this.deps.send("rooms", activeRooms, connection);
	}

	broadcastRooms(): void {
		const activeRooms = this.getActiveRooms();

		this.deps.send("broadcast_rooms", activeRooms);
	}

	private getActiveRooms(): RoomData[] {
		return [...this._rooms.values()]
			.filter(({ isActive }) => isActive)
			.map(
				(room): RoomData => ({
					id: room.id,
					name: room.name,
					learningGoal: room.learningGoal,
					isActive: true,
					createdAt: room.createdAt,
					viewersCount: room.viewersCount,
					owner: room.owner,
				}),
			);
	}
}
