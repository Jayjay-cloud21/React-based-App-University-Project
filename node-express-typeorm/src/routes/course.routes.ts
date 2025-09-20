import { Router } from "express";
import { CourseController } from "../controller/CourseController";

const router = Router();
const courseController = new CourseController();

router.get("/courses", async (req, res) => {
	await courseController.getCourses(req, res);
});

router.get("/courses/lecturer/:id", async (req, res) => {
	await courseController.getCoursesForLecturer(req, res);
});

router.post("/seed-courses", async (req, res) => {
	await courseController.seedCourses(req, res);
});

export default router;
