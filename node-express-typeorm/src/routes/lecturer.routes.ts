import { Router } from "express";
import { LecturerController } from "../controller/LecturerController";

const router = Router();
const lecturerController = new LecturerController();

router.get("/courses/:code/applications", async (req, res) => {
	await lecturerController.getApplicationsByCourseCode(req, res);
});

router.get("/applications", async (req, res) => {
	await lecturerController.getAllApplications(req, res);
});

router.post("/courses/:code/selected", async (req, res) => {
	await lecturerController.selectApplication(req, res);
});

router.get("/courses/:code/selected", async (req, res) => {
	await lecturerController.getSelectedApplicationsByCourseCode(req, res);
});

router.delete("/courses/:code/unselect", async (req, res) => {
	await lecturerController.unselectApplication(req, res);
});

router.patch("/courses/:code/demote", async (req, res) => {
	await lecturerController.demoteSelectedApplication(req, res);
});

router.patch("/courses/:code/promote", async (req, res) => {
	await lecturerController.promoteSelectedApplication(req, res);
});

router.get(
	"/courses/:code/selected/:selectedApplicationId/comments",
	async (req, res) => {
		await lecturerController.getCommentsForSelection(req, res);
	}
);

router.post("/courses/:code/selected/comments", async (req, res) => {
	await lecturerController.addCommentToSelection(req, res);
});

export default router;
