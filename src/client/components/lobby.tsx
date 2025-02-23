import { countryCodeEmoji } from "../utils";
import { useLobby } from "../providers/lobby.provider";
import { Accordion, AccordionItem } from "@szhsin/react-accordion";
import type { UserData } from "../../types";

export const Lobby = () => {
	const lobby = useLobby((state) => state.lobby);

	if (!lobby) return "Loading...";

	return (
		<div>
			{lobby.total} user{lobby.total !== 1 ? "s" : ""} online.
			<Accordion
				transition
				transitionTimeout={250}
				className="rounded-lg overflow-hidden m-2 border border-slate-300 w-74"
				initialEntered
				allowMultiple
			>
				{Array.isArray(lobby.ready) && (
					<AccordionItem
						header={`Ready (${lobby.ready.length})`}
						buttonProps={{
							className:
								"p-1.5 bg-slate-300/70 w-full flex justify-between text-xs font-semibold",
						}}
						disabled
						contentProps={{
							className: "transition-[height]",
							onClick: (e) => {
								if (e.target instanceof HTMLElement) {
									const buttonElement = e.target.closest(
										"[data-username]",
									) as HTMLButtonElement;
									console.log(buttonElement.dataset.username);
								}
							},
						}}
					>
						{lobby.ready.length > 0 ? (
							<UsersList users={lobby.ready} />
						) : (
							<div className="text-xs p-1.5">
								No users are ready,{" "}
								<span className="underline underline-offset-2">
									invite a friend
								</span>
								?
							</div>
						)}
					</AccordionItem>
				)}
				{Array.isArray(lobby.idle) && lobby.idle.length > 0 && (
					<>
						<hr className="border-gray-300" />

						<AccordionItem
							header={`Idle players (${lobby.idle.length})`}
							buttonProps={{
								className:
									"p-1.5 bg-slate-300/70 w-full flex justify-between cursor-pointer text-xs font-semibold",
							}}
							contentProps={{ className: "transition-[height]" }}
						>
							<UsersList users={lobby.idle} />
						</AccordionItem>
					</>
				)}
			</Accordion>
		</div>
	);
};

const UsersList = ({ users }: { users: UserData[] }) => {
	return (
		<ul>
			{users.map((user) => (
				<li key={user.id}>
					<button
						type="button"
						className="flex gap-2 items-center p-1.5 w-full hover:bg-slate-300/30 transition-colors cursor-pointer"
						data-username={user.username}
					>
						<span
							className={`${user.ready ? "bg-green-500/75" : "bg-gray-300"} transition-colors size-1.5 rounded-full`}
						/>
						<span className="text-xs font-medium">
							{user.name || "No name"}
						</span>

						<span className="overflow-hidden size-3.5 rounded-full inline-block relative">
							<span className="text-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
								{countryCodeEmoji(user.from)}
							</span>
						</span>
					</button>
				</li>
			))}
		</ul>
	);
};
