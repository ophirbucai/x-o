export type InteractionEvent<T extends HTMLElement = HTMLElement> =
	| React.MouseEvent<T>
	| React.KeyboardEvent<T>;
