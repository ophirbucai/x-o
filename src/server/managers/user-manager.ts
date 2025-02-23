import { BaseManager } from "./base-manager";
import type { ManagerDeps, UserData } from "../../types";
import type { LobbyManager } from "./lobby-manager";
import { filter } from "rxjs/operators";
import type { Connection, ConnectionContext } from "partyserver";

export class UserManager extends BaseManager {
	constructor(
		deps: ManagerDeps,
		private readonly lobbyManager: LobbyManager,
	) {
		super(deps);
	}
	protected setupSubscriptions(): void {
		this.deps.messages$
			.pipe(filter(({ type }) => type === "get_user"))
			.subscribe(({ connection }) =>
				this.deps.send("user", connection.state, connection),
			);

		this.deps.messages$
			.pipe(filter(({ type }) => ["ready_user", "rename_user"].includes(type)))
			.subscribe(({ type, connection, payload }) => {
				const key: keyof UserData = type === "ready_user" ? "ready" : "name";
				this.updateUser(connection, { [key]: payload });
			});
	}

	public async hydrateUser(
		connection: Connection<UserData>,
		ctx: ConnectionContext,
		username: string,
	) {
		let data: Partial<UserData> = { name: null, ready: false, username };

		try {
			data = {
				...data,
				...JSON.parse((await this.deps.env.SESSIONS.get(username)) || "{}"),
			};
		} catch {}

		this.updateUser(connection, {
			...data,
			id: connection.id,
			from: (ctx.request.cf?.country as string) ?? "unknown",
		});
	}

	private async updateUser(
		connection: Connection<UserData>,
		data: Partial<UserData>,
	) {
		const user = connection.state as UserData;
		const updatedUser = { ...user, ...data };

		await this.updateUserState(connection, updatedUser);

		this.deps.send("user", updatedUser, connection);
		this.lobbyManager.broadcastLobby();
	}

	private async updateUserState(connection: Connection, user: UserData) {
		connection.setState(user);
		this.lobbyManager.updateUser(user);
		await this.deps.env.SESSIONS.put(user.username, JSON.stringify(user), {
			expirationTtl: 3600,
		});
	}
}
