import type PartySocket from "partysocket";
import usePartySocket from "partysocket/react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
} from "react";
import { Subject } from "rxjs";
import type { EventData, SendMethod, SendEvent, SendEventMap } from "../types";
import { getAuthToken } from "../utils/get-auth-token";

const PartyContext = createContext<{
	socket: PartySocket;
	message$: Subject<EventData>;
	send: typeof SendMethod;
} | null>(null);

export const PartyProvider = ({ children }: { children: React.ReactNode }) => {
	const message$ = useRef(new Subject<EventData>()).current;

	const socket = usePartySocket({
		party: "my-server",
		room: "room1",
		query: async () => ({
			token: await getAuthToken(),
		}),
		onMessage: (evt: MessageEvent<string>) =>
			message$.next(JSON.parse(evt.data)),
	});

	const send: typeof SendMethod = useCallback(
		(type, ...args) => {
			const payload = args[0];
			const data: SendEvent = {
				type,
				payload: payload as SendEventMap[typeof type],
			};
			socket.send(JSON.stringify(data));
		},
		[socket.send],
	);

	useEffect(() => {
		return () => socket.close();
	});

	return (
		<PartyContext value={{ socket, message$, send }}>{children}</PartyContext>
	);
};

export const useParty = () => {
	const socket = useContext(PartyContext);
	if (!socket) throw new Error("useParty must be used within PartyProvider");
	return socket;
};
