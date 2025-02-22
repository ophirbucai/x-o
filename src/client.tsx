import "./assets/styles.css";
import { createRoot } from "react-dom/client";
import { usePartySocket } from "partysocket/react";
import { useCallback, useEffect, useState } from "react";
import { Board } from "./components/board";
import { Lobby } from "./components/lobby";
import type { LobbyData } from "./types/lobby-data.type";
import type { EventData } from "./types/event-data.type";

function App() {
	const [lobby, setLobby] = useState<null | LobbyData>();
	const socket = usePartySocket({
		party: "my-server",
		room: "room1",
		onMessage(evt) {
			const data = JSON.parse(evt.data) as EventData;
			if (data.type === "lobby") setLobby(data.payload);
		},
	});

	const sendEvent = useCallback(
		(type: EventData["type"]) => socket.send(type),
		[socket.send],
	);

	useEffect(() => {
		!lobby && sendEvent("lobby");
	}, [lobby, sendEvent]);

	return (
		<div>
			{lobby && <Lobby {...lobby} />}
			<Board />
		</div>
	);
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
