import type { Connection } from "partyserver";
import type { LobbyData, UserData } from "../../types";
import { BaseManager } from "./base-manager";
import { filter } from "rxjs/operators";

export class LobbyManager extends BaseManager {
	_lobby = {
		users: new Map<string, UserData>(),
	};

	get lobby(): LobbyData {
		const readyUsers: UserData[] = [];
		const idleUsers: UserData[] = [];

		for (const user of this._lobby.users.values()) {
			(user.ready ? readyUsers : idleUsers).push(user);
		}
		return {
			ready: readyUsers,
			idle: idleUsers,
			total: this._lobby.users.size,
		};
	}
	protected setupSubscriptions(): void {
		this.deps.messages$
			.pipe(filter(({ type }) => type === "get_lobby"))
			.subscribe(() => this.broadcastLobby());
	}

	public broadcastLobby() {
		this.deps.send("lobby", this.lobby);
	}

	public updateUser(user: UserData) {
		this._lobby.users.set(user.username, user);
	}

	public init(connections: Connection<UserData>[]) {
		for (const connection of connections) {
			if (connection.state) {
				this._lobby.users.set(connection.state.username, {
					from: connection.state.from,
					name: connection.state.name,
					ready: connection.state.ready,
					id: connection.id,
					username: connection.state.username,
				});
			}
		}
	}

	public cleanupConnection(connection: Connection<UserData>) {
		if (!connection.state) return;
		this._lobby.users.delete(connection.state.username);
		this.broadcastLobby();
	}
}
