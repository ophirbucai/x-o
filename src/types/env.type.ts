import type { MyServer } from "../server";

export type Env = {
	MyServer: DurableObjectNamespace<MyServer>;
	SESSIONS: KVNamespace;
	JWT_SECRET: string;
};
