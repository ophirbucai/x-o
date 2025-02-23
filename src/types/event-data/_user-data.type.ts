export type UserData = {
	id: string;
	name: string | null;
	from: string;
	ready: boolean;
	username: string;
};

export type RedactedUserData = Omit<UserData, "username">;
