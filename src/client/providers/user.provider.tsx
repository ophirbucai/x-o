import { createContext, useContext, useEffect, useRef } from "react";
import { useStore } from "zustand/react";
import { createStore } from "zustand";
import { useParty } from "./party.provider";
import type { SendMethod, UserData } from "../../types";
import { filterEventData } from "../utils/filter-event-data";

interface UserState {
	user: UserData | null;
	renameUser: (name: string) => void;
	updateReady: (state: boolean) => void;
	refetchName: () => void;
}

const createUserStore = (send: typeof SendMethod) =>
	createStore<UserState>(() => ({
		user: null,
		renameUser: (name: string) => send("rename_user", name),
		updateReady: (state: boolean) => send("ready_user", state),
		refetchName: () => send("get_user"),
	}));

type UserStore = ReturnType<typeof createUserStore>;

export const UserContext = createContext<UserStore | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
	const { send, message$ } = useParty();
	const store = useRef<UserStore | null>(null);

	if (!store.current) {
		store.current = createUserStore(send);
	}

	useEffect(() => {
		const subscription = message$
			.pipe(filterEventData("user"))
			.subscribe(({ payload }) => store.current?.setState({ user: payload }));

		send("get_user");

		return () => subscription.unsubscribe();
	}, [message$, send]);

	return (
		<UserContext.Provider value={store.current}>
			{children}
		</UserContext.Provider>
	);
};

export function useUser<T>(selector: (store: UserState) => T): T {
	const store = useContext(UserContext);
	if (!store) {
		throw new Error("useUserStore must be used within UserProvider");
	}
	return useStore(store, selector);
}
