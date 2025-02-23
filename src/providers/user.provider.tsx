import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
} from "react";
import type { UserData } from "../types/event-data/_user-data.type";
import { useStore } from "zustand/react";
import { createStore } from "zustand";
import { useParty } from "./party.provider";
import { filter } from "rxjs";
import type { SendMethod } from "../types";

interface UserState {
	user: UserData | null;
	renameUser: (name: string) => void;
	updateReady: (state: boolean) => void;
}

const createUserStore = (send: typeof SendMethod) =>
	createStore<UserState>(() => ({
		user: null,
		renameUser: (name: string) => send("rename_user", name),
		updateReady: (state: boolean) => send("ready_user", state),
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
			.pipe(filter((evt) => evt.type === "user"))
			.subscribe(({ type, payload }) =>
				store.current?.setState({ [type]: payload }),
			);

		send("get_user");

		return () => subscription.unsubscribe();
	}, [message$, send]);

	return (
		<UserContext.Provider value={store.current}>
			{children}
		</UserContext.Provider>
	);
};

export function useUserStore<T>(selector: (store: UserState) => T): T {
	const store = useContext(UserContext);
	if (!store) {
		throw new Error("useUserStore must be used within UserProvider");
	}
	return useStore(store, selector);
}
