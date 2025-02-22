import { countryCodeEmoji } from "../utils";
import { useLobbyStore } from "../providers/lobby.provider";

export const Lobby = () => {
	const lobby = useLobbyStore((state) => state.lobby);

	if (!lobby) return "Loading...";

	return (
		<div>
			{lobby.total} user{lobby.total !== 1 ? "s" : ""} online. (
			{Object.entries(lobby.from || {})
				.map(([from, count]) => {
					return `${count} from ${countryCodeEmoji(from)}`;
				})
				.join(", ")}
			)
		</div>
	);
};
