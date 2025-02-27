import { BaseManager } from "./base-manager";
import { Room } from "../models/room";
import { filterSendEvent } from "../utils/filter-send-event";
import type {
	RoomData,
	RoomDataWithRelations,
	RoomId,
	SendEvent,
} from "../../types";
import { filter } from "rxjs/operators";

export class RoomManager extends BaseManager {
	private _rooms = new Map<RoomId, RoomDataWithRelations>();

	protected setupSubscriptions(): void {
		const subject = this.deps.messages$;

		subject
			.pipe(filterSendEvent("create_room"))
			.subscribe(this.createRoom.bind(this));

		subject
			.pipe(filterSendEvent("get_rooms"))
			.subscribe(this.getRooms.bind(this));

		subject
			.pipe(filterSendEvent("join_room", "leave_room"))
			.subscribe(this.leaveOrJoinRoom.bind(this));

		subject
			.pipe(filterSendEvent("update_room"))
			.pipe(filter(this.isRoomOwner.bind(this)))
			.subscribe(this.updateRoom.bind(this));
	}

	private isRoomOwner(evt: SendEvent<"update_room">): boolean {
		const room = this.getRoomById(evt.payload.id);

		if (!room) return false;

		return room.owner.id === evt.connection.state?.id;
	}

	updateRoom({ payload }: SendEvent<"update_room">) {
		const room = this.getRoomById(payload.id);

		if (!room) return;

		if (payload.learningGoal) {
			room.learningGoal = payload.learningGoal;
		}
		if (payload.name) {
			room.name = payload.name;
		}
		if (payload.isActive) {
			room.isActive = payload.isActive;
		}

		this._rooms.set(room.id, room);

		this.broadcastRooms();
	}

	createRoom({ payload }: SendEvent<"create_room">) {
		const room = new Room(payload);

		this._rooms.set(room.id, room);
	}

	getRooms({ connection }: SendEvent<"get_rooms">): void {
		const activeRooms = this.getActiveRooms();

		this.deps.send("rooms", activeRooms, connection);
	}

	private getRoomById(roomId: RoomId): RoomDataWithRelations | null {
		return this._rooms.get(roomId) ?? null;
	}

	leaveOrJoinRoom({
		type,
		payload: roomId,
		connection,
	}: SendEvent<"join_room" | "leave_room">) {
		const room = this.getRoomById(roomId);

		if (!room)
			return; /* Room closed, todo: navigate the user back to the lobby */

		const viewerId = connection.state?.id;

		if (!viewerId) return;

		if (type === "join_room") {
			room._viewers.add(viewerId);
		}
		if (type === "leave_room") {
			room._viewers.delete(viewerId);
		}

		this.broadcastRooms();
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
