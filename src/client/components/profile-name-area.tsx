import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "../providers/user.provider";

export const ProfileNameArea = () => {
	const { user, renameUser, refetchName } = useUser((state) => state);
	const [name, setName] = useState(user?.name);

	const submitName = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			if (e.target instanceof HTMLFormElement) {
				(document.activeElement as HTMLElement)?.blur();
				const name = new FormData(e.target).get("name") as string;
				renameUser(name);
			}
		},
		[renameUser],
	);

	useEffect(() => {
		setName(user?.name);
	}, [user]);

	return (
		<form onSubmit={submitName} className="relative">
			<input
				placeholder="What is your name?"
				value={name ?? ""}
				onChange={(e) => setName(e.target.value)}
				onBlur={() => refetchName()}
				aria-label="Your name"
				name="name"
				className="bg-white/50 px-1.5 py-0.5 rounded-sm shadow-sm placeholder:text-slate-400 text-sm focus:outline-solid focus:outline-blue-300/50 focus:outline-3 w-52 focus:pr-6 peer"
				required
				autoComplete="off"
			/>
			<button
				type="submit"
				className="absolute right-0 text-xs top-1/2 -translate-y-1/2 text-blue-500 font-semibold peer-focus:block hidden cursor-pointer p-1.5"
			>
				✓
			</button>
		</form>
	);
};
