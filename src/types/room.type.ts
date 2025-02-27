import type { UserData } from "./event-data";

export type RoomData = {
	readonly id: RoomId;
	name: string;
	learningGoal: string;
	isActive: boolean;
	readonly createdAt: string | Date;
	readonly owner: UserData;
	viewersCount?: number;
};

export type RoomRelations = {
	_viewers: UserData[];
};

export type RoomDataWithRelations = RoomData & RoomRelations;

export type RoomId = `room_${string}`;
