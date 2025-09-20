"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const data_source_1 = require("../data-source");
const Course_1 = require("../entity/Course");
class CourseController {
    constructor() {
        this.courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
    }
    seedCourses(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // check if courses already exist
                const existingCoursesCount = yield this.courseRepository.count();
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
                        description: "Learn the fundamentals of computer science and programming",
                        startDate: "2025-03-01",
                        endDate: "2025-06-01",
                    },
                    {
                        code: "COSC0001",
                        name: "Full Stack Development",
                        description: "Learn to build complete web applications with frontend and backend",
                        startDate: "2025-03-01",
                        endDate: "2025-06-01",
                    },
                    {
                        code: "COSC0089",
                        name: "Algorithms and Analysis",
                        description: "Study algorithms and their computational complexity",
                        startDate: "2025-03-01",
                        endDate: "2025-06-01",
                    },
                    {
                        code: "COSC0003",
                        name: "Data Structures",
                        description: "Fundamental data structures and their applications",
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
                const savedCourses = yield this.courseRepository.save(coursesToSeed);
                return response.status(201).json({
                    message: `Successfully seeded ${savedCourses.length} courses`,
                    courses: savedCourses,
                });
            }
            catch (error) {
                console.error("Error seeding courses:", error);
                return response.status(500).json({
                    message: "Failed to seed courses",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    getCourses(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // fetch coourses from the database
                const courses = yield this.courseRepository.find({
                    order: {
                        code: "ASC", // order by course code
                    },
                });
                // return courses as json
                return response.json(courses);
            }
            catch (error) {
                console.error("Error fetching courses:", error);
                return response.status(500).json({ message: "Internal server error" });
            }
        });
    }
    getCoursesForLecturer(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const lecturerId = parseInt(request.params.id, 10);
                if (!lecturerId) {
                    return response.status(400).json({
                        message: "Lecturer ID is required",
                    });
                }
                // fetch courses assigned to the lecturer
                const coursesForLecturer = yield this.courseRepository.find({
                    where: { lecturerId: lecturerId },
                    order: {
                        code: "ASC", // order by course code
                    },
                });
                return response.json({
                    success: true,
                    data: coursesForLecturer, // empty array if no courses assigned to current Lecturer
                    message: coursesForLecturer.length === 0
                        ? `No courses assigned to lecturer ${lecturerId}`
                        : `Found ${coursesForLecturer.length} courses for lecturer ${lecturerId}`,
                });
            }
            catch (error) {
                console.error("Error fetching courses for lecturer:", error);
                return response.status(500).json({
                    success: false,
                    message: "Internal server error",
                });
            }
        });
    }
}
exports.CourseController = CourseController;
//# sourceMappingURL=CourseController.js.map