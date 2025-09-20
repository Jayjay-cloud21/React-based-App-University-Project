import { Router } from "express";
import { UserController } from "../controller/UserController";

const router = Router();
const userController = new UserController();

router.get("/users", async (req, res) => {
	await userController.all(req, res);
});

router.get("/users/:id", async (req, res) => {
	await userController.one(req, res);
});

router.get("/applications/user/:userId", async (req, res) => {
	await userController.getProfilesByUserId(req, res);
});


router.post("/users", async (req, res) => {
	await userController.save(req, res);
});

router.post("/users/authenticate", async (req, res) => {
	await userController.authenticate(req, res);
});

router.post("/applications", async (req, res) => {
	await userController.saveApplication(req, res);
});

router.put("/users/:id", async (req, res) => {
	await userController.update(req, res);
});

router.delete("/users/:id", async (req, res) => {
	await userController.remove(req, res);
});


export default router;
