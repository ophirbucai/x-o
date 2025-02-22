import { useRef, useState } from "react";
import { Square } from "./square";
import type { InteractionEvent } from "../types/interaction-event.type";
import { calculateWinner, isButtonElement, keyEventFilter } from "../utils";
import type { XO } from "../types/xo.type";

export const Board = () => {
	const boardRef = useRef<HTMLDivElement>(null);
	const [squares, setSquares] = useState(Array<XO | null>(9).fill(null));
	const [isXNext, setIsXNext] = useState(true);

	const boardClickHandler = (e: InteractionEvent) => {
		if (isButtonElement(e.target)) {
			console.log(e.target.dataset.square);
		}
	};

	const winner = calculateWinner(squares);

	const status = winner
		? `Winner: ${winner}`
		: `Next Player: ${isXNext ? "X" : "O"}`;

	return (
		<div className="flex flex-col items-center gap-4 h-screen justify-center">
			<div className="text-xl font-semibold">{status}</div>
			<div
				className="grid grid-cols-3 gap-1 size-48"
				ref={boardRef}
				onMouseUp={boardClickHandler}
				onKeyUp={keyEventFilter(" ", "Enter")(boardClickHandler)}
			>
				{squares.map((value, index) => (
					<Square key={String(index)} square={index + 1} value={value} />
				))}
			</div>
		</div>
	);
};
