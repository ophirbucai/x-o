import { ProfileNameArea } from "./profile-name-area";
import { ProfileReadyArea } from "./profile-ready-area";

export const Profile = () => {
	return (
		<header className="flex gap-4 p-1.5 justify-around">
			<ProfileNameArea />
			<ProfileReadyArea />
		</header>
	);
};
