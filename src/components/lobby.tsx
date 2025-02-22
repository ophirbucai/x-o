import type { LobbyData } from "../types/lobby-data.type";
import { countryCodeEmoji } from "../utils";

export const Lobby = ({ total, from }: LobbyData) => {
	return (
		<div>
			{total} user{total !== 1 ? "s" : ""} online. (
			{Object.entries(from || {})
				.map(([from, count]) => {
					return `${count} from ${countryCodeEmoji(from)}`;
				})
				.join(", ")}
			)
		</div>
	);
};
