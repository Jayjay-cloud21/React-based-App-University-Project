import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Course } from "../entity/Course";

export class CourseController {
	private courseRepository = AppDataSource.getRepository(Course);

	async seedCourses(request: Request, response: Response) {
		try {
			// check if courses already exist
			const existingCoursesCount = await this.courseRepository.count();
			if (existingCoursesCount > 0) {
				return response.json({
					message: `Database already has ${existingCoursesCount} courses`,
					alreadySeeded: true,
				});
			}

			const coursesToSeed = [
				{
					code: "COSC0000",
					name: "Introduction to Computer Science",
					description:
						"Learn the fundamentals of computer science and programming",
					startDate: "2025-03-01",
					endDate: "2025-06-01",
				},
				{
					code: "COSC0001",
					name: "Full Stack Development",
					description:
						"Learn to build complete web applications with frontend and backend",
					startDate: "2025-03-01",
					endDate: "2025-06-01",
				},
				{
					code: "COSC0089",
					name: "Algorithms and Analysis",
					description:
						"Study algorithms and their computational complexity",
					startDate: "2025-03-01",
					endDate: "2025-06-01",
				},
				{
					code: "COSC0003",
					name: "Data Structures",
					description:
						"Fundamental data structures and their applications",
					startDate: "2025-03-01",
					endDate: "2025-06-01",
				},
				{
					code: "COSC0004",
					name: "Database Management Systems",
					description: "Design and implementation of database systems",
					startDate: "2025-03-01",
					endDate: "2025-06-01",
				},
				{
					code: "COSC0005",
					name: "Software Engineering Fundamentals",
					description: "Software development methodologies and practices",
					startDate: "2025-03-01",
					endDate: "2025-06-01",
				},
				{
					code: "COSC0006",
					name: "Web Development",
					description: "Build and deploy modern web applications",
					startDate: "2025-03-01",
					endDate: "2025-06-01",
				},
			];

			// save all courses
			const savedCourses = await this.courseRepository.save(coursesToSeed);

			return response.status(201).json({
				message: `Successfully seeded ${savedCourses.length} courses`,
				courses: savedCourses,
			});
		} catch (error) {
			console.error("Error seeding courses:", error);
			return response.status(500).json({
				message: "Failed to seed courses",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	async getCourses(request: Request, response: Response) {
		try {
			// fetch coourses from the database
			const courses = await this.courseRepository.find({
				order: {
					code: "ASC", // order by course code
				},
			});

			// return courses as json
			return response.json(courses);
		} catch (error) {
			console.error("Error fetching courses:", error);
			return response.status(500).json({ message: "Internal server error" });
		}
	}

	async getCoursesForLecturer(request: Request, response: Response) {
		// takes lecturer ID as input and returns courses assigned to that lecturer
		try {
			const lecturerId = parseInt(request.params.id, 10);

			if (!lecturerId) {
				return response.status(400).json({
					message: "Lecturer ID is required",
				});
			}

			// check that lecturerId field in the course entity matches the input lecturerId
			const coursesForLecturer = await this.courseRepository.find({
				where: { lecturerId: lecturerId },
				order: {
					code: "ASC", // order by course code
				},
			});

			return response.json({
				success: true,
				data: coursesForLecturer, // empty array if no courses assigned to current Lecturer
				message:
					coursesForLecturer.length === 0
						? `No courses assigned to lecturer ${lecturerId}`
						: `Found ${coursesForLecturer.length} courses for lecturer ${lecturerId}`,
			});
		} catch (error) {
			console.error("Error fetching courses for lecturer:", error);
			return response.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	}
}
