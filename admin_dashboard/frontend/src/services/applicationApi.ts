import { client } from "./apollo-client";
import {
	GET_SELECTED_APPLICATIONS_FOR_COURSE,
	GET_ALL_COURSE_SELECTIONS,
} from "./graphql";
import { Application } from "./types";

export const applicationApi = {
	getSelectedApplicationsForCourse: async (courseCode: string) => {
		const { data } = await client.query({
			query: GET_SELECTED_APPLICATIONS_FOR_COURSE,
			variables: { courseCode },
		});

		return (data.selectedApplicationsForCourse as Application[]) || [];
	},

	// returns all course selections over all courses
	getAllCourseSelections: async (): Promise<Application[]> => {
		try {
			const { data } = await client.query({
				query: GET_ALL_COURSE_SELECTIONS,
				fetchPolicy: "cache-first", // add caching for performance
			});

			return (data.getAllCourseSelections as Application[]) || [];
		} catch (error) {
			console.error("Error fetching all course selections:", error);
			throw new Error("Failed to fetch course selections");
		}
	},
};
