import { client } from "./apollo-client";
import { GET_COURSES,  ASSIGN_LECTURER, DELETE_COURSE, EDIT_COURSE, ADD_COURSE} from "./graphql";
import { Course, ActionToCourseResponse, AddCourseResponse, EditCourseResponse} from "./types";

export const courseApi = {
	courses: async (): Promise<Course[]> => {
		const { data } = await client.query({
			query: GET_COURSES,
		});

		return data.courses as Course[];
	},

	getCourse: async (code: string): Promise<Course> => {
		const { data } = await client.query({
			query: GET_COURSES,
			variables: { code },
		});

		return data.course as Course;
	},

	getCoursesByLecturer: async (lecturerId: string): Promise<Course[]> => {
		const { data } = await client.query({
			query: GET_COURSES,
			variables: { lecturerId },
		});

		return data.courses as Course[];
	},

	assignLecturerToCourse: async(courseCode: string, lecturerId: number): Promise<Course> => {
		const { data } = await client.mutate({
			mutation: ASSIGN_LECTURER,
			variables: {courseCode, lecturerId},
		});

		return data.assignLecturerToCourse as Course;
	},

	addCourse: async(code: string, name: string, startDate: string, endDate: string, description: string, lecturerId?: number): Promise<AddCourseResponse> => {
		const { data } = await client.mutate({
			mutation: ADD_COURSE,
			variables: {code, name, startDate, endDate, description, lecturerId},
		})
		return data.addCourse as AddCourseResponse;
	},

	deleteCourse: async(courseCode: string): Promise<ActionToCourseResponse> => {
		const { data } = await client.mutate({
			mutation: DELETE_COURSE,
			variables: { courseCode },
		});
		return data.deleteCourse as ActionToCourseResponse;
	},

	editCourse: async(code: string, name: string, startDate: string, endDate: string, description: string, lecturerId?: number | null): Promise<EditCourseResponse> => {
		const { data } = await client.mutate({
			mutation: EDIT_COURSE,
			variables: {code, name, startDate, endDate, description, lecturerId},
		});
		return data.editCourse as EditCourseResponse;
	}
};
