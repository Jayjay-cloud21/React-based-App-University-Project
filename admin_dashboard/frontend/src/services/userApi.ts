import { client } from "./apollo-client";
import {
	GET_USER,
	GET_LECTURERS,
	GET_CANDIDATES,
	BLOCK_USER,
	UNBLOCK_USER,
	GET_UNSELECTED_CANDIDATES,
	GET_CANDIDATES_WITH_MANY_APPLICATIONS,
} from "./graphql";
import { User, UserRole } from "./types";

// user-related API

export const userApi = {
	getUser: async (id: string): Promise<User> => {
		const { data } = await client.query({
			query: GET_USER,
			variables: { id },
		});
		return data.user as User;
	},

	lecturers: async (): Promise<User[]> => {
		const { data } = await client.query({
			query: GET_LECTURERS,
		});

		return data.lecturers as User[];
	},
	candidates: async (): Promise<User[]> => {
		const { data } = await client.query({
			query: GET_CANDIDATES,
		});

		return data.candidates as User[];
	},

	getUsersByRole: async (role: UserRole): Promise<User[]> => {
		const { data } = await client.query({
			query: GET_USER,
			variables: { role },
		});

		return data.users as User[];
	},

	blockUser: async (
		id: number
	): Promise<{ message: string; success: boolean }> => {
		const { data } = await client.mutate({
			mutation: BLOCK_USER,
			variables: { id },
		});

		return data.blockUser;
	},

	unblockUser: async (
		id: number
	): Promise<{ message: string; success: boolean }> => {
		const { data } = await client.mutate({
			mutation: UNBLOCK_USER,
			variables: { id },
		});

		return data.unblockUser;
	},

	getUnselectedCandidates: async (): Promise<User[]> => {
		try {
			const { data } = await client.query({
				query: GET_UNSELECTED_CANDIDATES,
				fetchPolicy: "cache-first",
			});

			return data.unselectedCandidates || [];
		} catch (error) {
			console.error("Error fetching unselected candidates:", error);
			throw new Error("Failed to fetch unselected candidates");
		}
	},

	getCandidatesWithManySelections: async (): Promise<User[]> => {
		try {
			const { data } = await client.query({
				query: GET_CANDIDATES_WITH_MANY_APPLICATIONS,
				fetchPolicy: "cache-first",
			});

			return data.candidatesWithManyApplications || [];
		} catch (error) {
			console.error(
				"Error fetching candidates with many applications:",
				error
			);
			throw new Error("Failed to fetch candidates with many applications");
		}
	},
};
