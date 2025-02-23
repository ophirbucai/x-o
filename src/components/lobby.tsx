import { countryCodeEmoji } from "../utils";
import { useLobbyStore } from "../providers/lobby.provider";

export const Lobby = () => {
	const lobby = useLobbyStore((state) => state.lobby);

	if (!lobby) return "Loading...";

	return (
		<div>
			{lobby.total} user{lobby.total !== 1 ? "s" : ""} online.
			{Array.isArray(lobby.users) && (
				<ul>
					{lobby.users.map((user) => (
						<li key={user.id}>
							<button
								type="button"
								className="flex gap-2 items-center text-sm font-bold"
							>
								<span>{user.name || "No name"}</span>

								<span className="overflow-hidden size-3.5 rounded-full inline-block relative">
									<span className="text-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
										{countryCodeEmoji(user.from)}
									</span>
								</span>
								<span
									className={`${user.ready ? "bg-green-500/75" : "bg-gray-300"} transition-colors size-1.5 rounded-full`}
								/>
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};
