const SERVER_URL = import.meta.env.SERVER_URL || "/my-server/room1";

export const getAuthToken = async (): Promise<string | undefined> => {
	try {
		const authToken = localStorage.getItem("authToken");
		if (authToken) return authToken;

		const res = await fetch(SERVER_URL);

		if (!res.ok) {
			throw new Error("Failed to fetch auth token");
		}

		const data = (await res.json()) as { token: string };
		localStorage.setItem("authToken", data.token);

		console.log("Fetched new token:", data.token);
		return data.token;
	} catch (e) {
		console.error(e);
	}
};
