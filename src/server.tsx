import type { Connection, ConnectionContext, WSMessage } from "partyserver";
import { Server, routePartykitRequest } from "partyserver";
import type {
	EventData,
	EventDataMap,
	LobbyData,
	SendEvent,
	UserData,
} from "./types";

type Env = {
	MyServer: DurableObjectNamespace<MyServer>;
};

const FROM_FALLBACK_KEY = "?";

export class MyServer extends Server<Env> {
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

	onStart(): void | Promise<void> {
		for (const connection of this.getConnections<{ from: string }>()) {
			const from = connection.state?.from || FROM_FALLBACK_KEY;
			this._lobby.users.set(connection.id, {
				from,
				name: null,
				ready: false,
				id: connection.id,
			});
		}
	}

	async onConnect(
		connection: Connection<{ from: string }>,
		ctx: ConnectionContext,
	): Promise<void> {
		const from = (ctx.request.cf?.country ?? "unknown") as string;
		// const userId = ctx.request.headers.get("X-User-Id");
		// const userRole = ctx.request.headers.get("X-User-Role");

		// if (!userId) {
		// 	connection.close(4001, "Unauthorized");
		// 	return;
		// }
		const user: UserData = {
			from,
			name: null,
			ready: false,
			id: connection.id,
			// role: userRole,
		};
		this._lobby.users.set(connection.id, user);
		connection.setState({ from });
		this.sendAll("lobby", this.lobby);
	}

	async onClose(connection: Connection<{ from: string }>): Promise<void> {
		this._lobby.users.delete(connection.id);
		this.sendAll("lobby", this.lobby);
	}

	async onError(
		connection: Connection<{ from: string }>,
		err: Error,
	): Promise<void> {
		console.error(err);
		await this.onClose(connection);
	}

	async send(connection: Connection, ...args: Parameters<typeof this.sendAll>) {
		const [type, payload] = args;
		const data: EventData = { type, payload };
		connection.send(JSON.stringify(data));
	}

	onMessage(connection: Connection, message: WSMessage): void | Promise<void> {
		const evt: SendEvent = JSON.parse(String(message));
		if (evt.type === "rename_user") {
			this.updateUser(connection, { name: evt.payload as string });
			this.send(connection, "user", this.getUser(connection.id));
		}
		if (evt.type === "ready_user") {
			this.updateUser(connection, { ready: evt.payload as boolean });
			this.send(connection, "user", this.getUser(connection.id));
		}
		if (evt.type === "get_user") {
			this.send(connection, "user", this.getUser(connection.id));
			return;
		}
		if (evt.type === "get_lobby") {
			this.send(connection, "lobby", this.lobby);
			return;
		}
	}

	private updateUser(connection: Connection, data: Partial<UserData>) {
		const user = this.getUser(connection.id);
		connection.setState({ ...user, ...data });
		this._lobby.users.set(connection.id, connection.state as UserData);
		this.sendAll("lobby", this.lobby);
	}

	private getUser(id: string): UserData | null {
		return this._lobby.users.get(id) as UserData;
	}

	private sendAll<T extends keyof EventDataMap>(
		type: T,
		payload: EventDataMap[T],
	): void {
		const data: EventData = { type, payload };
		this.broadcast(JSON.stringify(data));
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		return (
			(await routePartykitRequest(request, env)) ||
			new Response("Not found", {
				status: 404,
			})
		);
	},
} satisfies ExportedHandler<Env>;
