import NewUser from "../types/newUser";
import { api } from "./api";
import axios from "axios";

export const userApi = {
	createUser: async (user: NewUser) => {
		try {
			const response = await api.post<NewUser>("/users", user);
			return { success: true, data: response.data };
		} catch (error: unknown) {
			// check if it's an axios error
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 409) {
					return {
						success: false,
						message:
							error.response.data?.message ||
							"A user with this email already exists",
					};
				} else if (error.response?.status === 400) {
					return {
						success: false,
						message: error.response.data?.message || "Invalid input data",
					};
				} else if (error.response?.status === 500) {
					return {
						success: false,
						message: "Server error. Please try again later.",
					};
				}

				return {
					success: false,
					message:
						error.response?.data?.message || "Failed to create account",
				};
			}
			// nonhttp errors
			return {
				success: false,
				message: "Network error.",
			};
		}
	},

	checkUser: async (email: string, password: string) => {
		try {
			const response = await api.post("/users/authenticate", {
				email,
				password,
			});
			return { success: true, data: response.data };
		} catch (error: unknown) {
			// check if it's an axios error
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 401) {
					return { success: false, message: "Invalid email or password" };
				} else if (error.response?.status === 400) {
					return { success: false, message: "Invalid password" };
				} else if (error.response?.status === 403) {
					return {
						success: false,
						message: error.response.data?.message || "Account blocked",
					};
				}
			}
			// throw again if it's not an axios error
			throw error;
		}
	},
};
