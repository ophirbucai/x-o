import "./assets/styles.css";
import { createRoot } from "react-dom/client";
import { Lobby } from "./components/lobby";
import { PartyProvider } from "./providers/party.provider";
import { LobbyProvider } from "./providers/lobby.provider";

function App() {
	return (
		<PartyProvider>
			<LobbyProvider>
				<Lobby />
				{/* <Board /> */}
			</LobbyProvider>
		</PartyProvider>
	);
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
