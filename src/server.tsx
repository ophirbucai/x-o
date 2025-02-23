import type { Connection, ConnectionContext, WSMessage } from "partyserver";
import { Server, routePartykitRequest } from "partyserver";
import type {
	SendEvent,
	UserData,
	Env,
	ManagerDeps,
	EventDataMap,
	EventData,
} from "./types";
import { sign, verify } from "@tsndr/cloudflare-worker-jwt";
import {
	uniqueUsernameGenerator,
	adjectives,
	nouns,
} from "unique-username-generator";

import { share, Subject } from "rxjs";
import { LobbyManager } from "./server/managers/lobby-manager";
import { UserManager } from "./server/managers/user-manager";
import { isString } from "./server/utils/is-string";

export class MyServer extends Server<Env> {
	private readonly messageSubject$ = new Subject<SendEvent>();
	private readonly lobbyManager: LobbyManager;
	private readonly userManager: UserManager;

	constructor(state: DurableObjectState, env: Env) {
		super(state, env);

		const messages$ = this.messageSubject$.pipe(share());

		const deps: ManagerDeps = {
			env,
			messages$,
			send: this.send.bind(this),
		};

		this.lobbyManager = new LobbyManager(deps);
		this.userManager = new UserManager(deps, this.lobbyManager);
	}

	send<T extends keyof EventDataMap>(
		type: T,
		payload: EventDataMap[T],
		...[connection]: T extends "lobby" ? [] : [Connection<UserData>]
	) {
		const data: EventData = { type, payload };
		if (connection) connection.send(JSON.stringify(data));
		if (!connection && type === "lobby") this.broadcast(JSON.stringify(data));
	}

	onMessage(connection: Connection<UserData>, message: WSMessage): void {
		try {
			const { type, payload } = JSON.parse(String(message));
			this.messageSubject$.next({ type, connection, payload });
		} catch (error) {
			console.error("Error parsing message:", error);
			connection.close(4400, "Invalid message format");
		}
	}

	onStart() {
		this.lobbyManager.init([...this.getConnections<UserData>()]);
	}

	async onConnect(
		connection: Connection<UserData>,
		ctx: ConnectionContext,
	): Promise<void> {
		const token = new URL(ctx.request.url).searchParams.get("token");

		if (!token) {
			return connection.close(4001, "Missing token");
		}

		const data = await verify<{ username: string }>(token, this.env.JWT_SECRET);

		if (!isString(data?.payload?.username)) {
			return connection.close(4001, "Token couldn't be verified");
		}

		this.userManager.hydrateUser(connection, ctx, data.payload.username);
	}

	onClose(connection: Connection<UserData>): void {
		this.lobbyManager.cleanupConnection(connection);
	}

	onError(connection: Connection<UserData>, err: Error): void {
		console.error(connection, err);
		this.lobbyManager.cleanupConnection(connection);
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
