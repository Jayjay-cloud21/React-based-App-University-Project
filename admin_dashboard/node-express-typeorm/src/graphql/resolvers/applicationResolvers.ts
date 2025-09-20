import { AppDataSource } from "../../data-source";
import { Application } from "../../entity/Application";

const applicationRepository = AppDataSource.getRepository(Application);

export const applicationResolvers = {
	Query: {
		// fetch all applications for a specific course, including user and course details
		// not really being used because getAllCourseSelections is better
		selectedApplicationsForCourse: async (
			_: any,
			{ courseCode }: { courseCode: string }
		) => {
			const applications = await applicationRepository.find({
				where: { courseCode: courseCode, selected: true },
				relations: ["user", "course"],
			});

			if (!applications) {
				return [];
			}
			return applications;
		},

		// gets all course selections over all courses, including user and course details
		getAllCourseSelections: async () => {
			const applications = await applicationRepository.find({
				where: { selected: true },
				relations: ["user", "course"],
				order: {
					courseCode: "ASC",
					createdAt: "DESC",
				},
			});

			if (!applications) {
				return [];
			}
			return applications;
		},
	},
};
