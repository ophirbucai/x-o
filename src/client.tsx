import "./assets/styles.css";
import { createRoot } from "react-dom/client";
import { PartyProvider } from "./providers/party.provider";
import { LobbyProvider } from "./providers/lobby.provider";
import { UserProvider } from "./providers/user.provider";
import { Dashboard } from "./components/dashboard";

function App() {
	return (
		<PartyProvider>
			<UserProvider>
				<LobbyProvider>
					<Dashboard />
				</LobbyProvider>
			</UserProvider>
		</PartyProvider>
	);
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
