export const keyEventFilter =
	<T extends HTMLElement = HTMLElement>(...keys: string[]) =>
	(callback: React.KeyboardEventHandler<T>) =>
	(e: React.KeyboardEvent<T>) =>
		keys.includes(e.key) && callback(e);
