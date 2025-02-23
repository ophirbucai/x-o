import type { Connection, ConnectionContext, WSMessage } from "partyserver";
import { Server, routePartykitRequest } from "partyserver";
import type {
	EventData,
	EventDataMap,
	LobbyData,
	SendEvent,
	UserData,
} from "./types";
import { sign, verify } from "@tsndr/cloudflare-worker-jwt";
import {
	uniqueUsernameGenerator,
	adjectives,
	nouns,
} from "unique-username-generator";

type Env = {
	MyServer: DurableObjectNamespace<MyServer>;
	SESSIONS: KVNamespace;
	JWT_SECRET: string;
};

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

	async onStart() {
		const keys = await this.env.SESSIONS.list();
		for (const connection of this.getConnections<UserData>()) {
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

	async onConnect(
		connection: Connection<UserData>,
		ctx: ConnectionContext,
	): Promise<void> {
		const url = new URL(ctx.request.url);
		const token = url.searchParams.get("token");

		if (!token) {
			connection.close(4001, "Missing token");
			return;
		}

		const data = await verify<{ username: string }>(token, this.env.JWT_SECRET);

		if (typeof data?.payload?.username !== "string") {
			connection.close(4001, "Token couldn't be verified");
			return;
		}

		const username = data.payload.username;

		const sessionDataJson = await this.env.SESSIONS.get(username);
		const sessionData = JSON.parse(sessionDataJson || "{}");

		const userData: UserData = {
			from: (ctx.request.cf?.country ?? "unknown") as string,
			name: null,
			ready: false,
			username: username,
			...sessionData,
			id: connection.id,
		};

		await this.env.SESSIONS.put(username, JSON.stringify(userData), {
			expirationTtl: 3600,
		});
		connection.setState(userData);
		this._lobby.users.set(userData.username, userData);
		this.sendAll("lobby", this.lobby);
	}

	async onClose(connection: Connection<UserData>): Promise<void> {
		if (!connection.state) return;
		this._lobby.users.delete(connection.state.username);
		this.sendAll("lobby", this.lobby);
	}

	async onError(connection: Connection<UserData>, err: Error): Promise<void> {
		console.error(err);
		await this.onClose(connection);
	}

	async send(connection: Connection, ...args: Parameters<typeof this.sendAll>) {
		const [type, payload] = args;
		const data: EventData = { type, payload };
		connection.send(JSON.stringify(data));
	}

	onMessage(
		connection: Connection<UserData>,
		message: WSMessage,
	): void | Promise<void> {
		const evt: SendEvent = JSON.parse(String(message));
		const user = connection.state as UserData;
		if (evt.type === "rename_user") {
			this.updateUser(connection, { name: evt.payload as string });
		}
		if (evt.type === "ready_user") {
			this.updateUser(connection, { ready: evt.payload as boolean });
		}
		if (evt.type === "get_user") {
			this.send(connection, "user", this.getUser(user.username));
			return;
		}
		if (evt.type === "get_lobby") {
			this.send(connection, "lobby", this.lobby);
			return;
		}
	}

	private async updateUser(connection: Connection, data: Partial<UserData>) {
		const user = connection.state as UserData;
		const updatedUser = { ...user, ...data };
		this._lobby.users.set(updatedUser.username, updatedUser);
		connection.setState(updatedUser);

		await this.env.SESSIONS.put(user.username, JSON.stringify(updatedUser), {
			expirationTtl: 3600,
		});
		this.send(connection, "user", updatedUser);
		this.sendAll("lobby", this.lobby);
	}

	private getUser(username: string): UserData | null {
		return this._lobby.users.get(username) as UserData;
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
		const url = new URL(request.url);
		const token = url.searchParams.get("token");
		if (!token) {
			const username = uniqueUsernameGenerator({
				dictionaries: [nouns, adjectives],
				separator: "-",
			});

			const sessionToken = await sign({ username }, env.JWT_SECRET);

			return new Response(JSON.stringify({ token: sessionToken }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		return (
			(await routePartykitRequest(request, env)) ||
			new Response("Not found", {
				status: 404,
			})
		);
	},
} satisfies ExportedHandler<Env>;
