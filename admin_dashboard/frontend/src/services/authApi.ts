import { client } from "./apollo-client";
import { LOGIN } from "./graphql";
import { AuthPayload } from "./types";

export const authApi = {
	login: async (email: string, password: string): Promise<AuthPayload> => {
		const { data } = await client.mutate({
			mutation: LOGIN,
			variables: { email, password },
		});

		if (data.login.token) {
			localStorage.setItem("authToken", data.login.token);
		}

		return data.login;
	},

	logout: (): void => {
		localStorage.removeItem("authToken");
	},

	getToken: (): string | null => {
		return localStorage.getItem("authToken");
	},

	isAuthenticated: (): boolean => {
		return !!localStorage.getItem("authToken");
	},
};
