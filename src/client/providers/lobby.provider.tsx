import { createContext, useContext, useEffect, useRef } from "react";
import type { LobbyData } from "../../types";
import { useParty } from "./party.provider";
import { useStore } from "zustand/react";
import { createStore } from "zustand";
import { filterEventData } from "../utils/filter-event-data";

interface LobbyState {
	lobby: LobbyData | null;
}

const createLobbyStore = () =>
	createStore<LobbyState>(() => ({
		lobby: null,
	}));

type LobbyStore = ReturnType<typeof createLobbyStore>;

export const LobbyContext = createContext<LobbyStore | null>(null);

export const LobbyProvider = ({ children }: { children: React.ReactNode }) => {
	const store = useRef<LobbyStore>(null);
	const { send, message$ } = useParty();

	if (!store.current) {
		store.current = createLobbyStore();
	}

	useEffect(() => {
		const subscription = message$
			.pipe(filterEventData("broadcast_lobby"))
			.subscribe(({ payload }) => store.current?.setState({ lobby: payload }));

		send("get_lobby");

		return () => subscription.unsubscribe();
	}, [send, message$]);

	return (
		<LobbyContext.Provider value={store.current}>
			{children}
		</LobbyContext.Provider>
	);
};

export function useLobby<T>(selector: (store: LobbyState) => T): T {
	const store = useContext(LobbyContext);
	if (!store) {
		throw new Error("useLobbyStore must be used within LobbyProvider");
	}
	return useStore(store, selector);
}
