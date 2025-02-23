import type { XO } from "../types/xo.type";

interface Props {
	value: XO | null;
	square: number;
}
export const Square = ({ value, square }: Props) => {
	return (
		<button
			type="button"
			data-square={square}
			className="text-2xl font-bold flex items-center justify-center border border-blue-400 bg-blue-100 hover:bg-blue-200 cursor-pointer"
		>
			{value}
		</button>
	);
};
