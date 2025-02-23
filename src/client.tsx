import "./client/assets/styles.css";
import { createRoot } from "react-dom/client";
import { PartyProvider } from "./client/providers/party.provider";
import { LobbyProvider } from "./client/providers/lobby.provider";
import { UserProvider } from "./client/providers/user.provider";
import { Dashboard } from "./client/components/dashboard";

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
