import ReactSwitch from "react-switch";
import { useUserStore } from "../providers/user.provider";
import { useCallback } from "react";

export const ProfileReadyArea = () => {
	const { user, updateReady } = useUserStore((state) => state);

	const toggleReady = useCallback(
		(checked: boolean) => updateReady(checked),
		[updateReady],
	);

	return (
		<fieldset className="flex items-center text-sm gap-1.5">
			<label htmlFor="ready" className="tracking-tight">
				Ready to play?
			</label>
			<ReactSwitch
				id="ready"
				checkedIcon={false}
				uncheckedIcon={false}
				handleDiameter={14}
				onColor="#86d3ff"
				offColor="#cecece"
				boxShadow="0px 1px 4px rgba(0, 0, 0, 0.6)"
				activeBoxShadow="0px 0px 1px 4px rgba(0, 0, 0, 0.2)"
				height={16}
				width={30}
				defaultChecked={user?.ready}
				checked={user?.ready ?? false}
				disabled={!user}
				onChange={toggleReady}
			/>
		</fieldset>
	);
};
