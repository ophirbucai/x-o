import type PartySocket from "partysocket";
import usePartySocket from "partysocket/react";
import { createContext, useContext, useRef } from "react";
import { Subject } from "rxjs";
import type { EventData } from "../types/event-data.type";

const PartyContext = createContext<{
	socket: PartySocket;
	message$: Subject<EventData>;
} | null>(null);

export const PartyProvider = ({ children }: { children: React.ReactNode }) => {
	const message$ = useRef(new Subject<EventData>()).current;

	const socket = usePartySocket({
		party: "my-server",
		room: "room1",
		onMessage: (evt: MessageEvent<string>) =>
			message$.next(JSON.parse(evt.data)),
	});

	return <PartyContext value={{ socket, message$ }}>{children}</PartyContext>;
};

export const useParty = () => {
	const socket = useContext(PartyContext);
	if (!socket) throw new Error("useParty must be used within PartyProvider");
	return socket;
};
