// biome-ignore lint/suspicious/noExplicitAny: Infers type of constructor parameters
export type ConstructorOf<T extends new (...args: any[]) => any> =
	ConstructorParameters<T> extends []
		? never
		: ConstructorParameters<T> extends [infer P]
			? P
			: ConstructorParameters<T>;
