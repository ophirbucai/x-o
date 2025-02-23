import { Profile } from "./profile";
import { Lobby } from "./lobby";
import { useUser } from "../providers/user.provider";

export const Dashboard = () => {
	const user = useUser((state) => state.user);
	return (
		<div className="min-h-screen bg-slate-200">
			{user && (
				<>
					<Profile />
					<Lobby />
				</>
			)}
		</div>
	);
};
