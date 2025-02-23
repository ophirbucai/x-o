import { Profile } from "./profile";
import { Lobby } from "./lobby";

export const Dashboard = () => {
	return (
		<div className="min-h-screen bg-slate-200">
			<Profile />
			<Lobby />
		</div>
	);
};
