import type { Connection, ConnectionContext, WSMessage } from "partyserver";
import { Server, routePartykitRequest } from "partyserver";
import type { EventData, EventDataMap } from "./types/event-data.type";
import type { LobbyData } from "./types/lobby-data.type";

type Env = {
	MyServer: DurableObjectNamespace<MyServer>;
};

const FROM_FALLBACK_KEY = "?";

export class MyServer extends Server<Env> {
	lobby: LobbyData = {
		total: 0,
		from: {},
	};

	onStart(): void | Promise<void> {
		for (const connection of this.getConnections<{ from: string }>()) {
			const from = connection.state?.from || FROM_FALLBACK_KEY;
			this.lobby = {
				total: this.lobby.total + 1,
				from: {
					...this.lobby.from,
					[from]: (this.lobby.from[from] ?? 0) + 1,
				},
			};
		}
	}

	async onConnect(
		connection: Connection<{ from: string }>,
		ctx: ConnectionContext,
	): Promise<void> {
		const from = (ctx.request.cf?.country ?? "unknown") as string;
		this.lobby = {
			total: this.lobby.total + 1,
			from: {
				...this.lobby.from,
				[from]: (this.lobby.from[from] ?? 0) + 1,
			},
		};
		connection.setState({ from });
		this.sendAll("lobby", this.lobby);
	}

	async onClose(connection: Connection<{ from: string }>): Promise<void> {
		const from = connection.state?.from ?? FROM_FALLBACK_KEY;
		this.lobby = {
			total: this.lobby.total - 1,
			from: {
				...this.lobby.from,
				[from]: (this.lobby.from[from] ?? 0) - 1,
			},
		};
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

	onMessage(
		connection: Connection,
		message: WSMessage | keyof EventDataMap,
	): void | Promise<void> {
		if (message === "lobby") this.send(connection, "lobby", this.lobby);
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
