import "./assets/styles.css";
import { createRoot } from "react-dom/client";
import { usePartySocket } from "partysocket/react";
import { useEffect } from "react";
import { Board } from "./components/board";

function App() {
	const socket = usePartySocket({
		party: "my-server",
		room: "room1",
		onMessage(message) {
			console.log("message from server:", message);
		},
	});
	useEffect(() => {
		socket.send("hello from the client!");
	}, [socket]);
	return (
		<div>
			<Board />
		</div>
	);
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
