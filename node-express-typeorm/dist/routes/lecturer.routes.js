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
const express_1 = require("express");
const LecturerController_1 = require("../controller/LecturerController");
const router = (0, express_1.Router)();
const lecturerController = new LecturerController_1.LecturerController();
router.get("/courses/:code/applications", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield lecturerController.getApplicationsByCourseCode(req, res);
}));
router.get("/applications", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield lecturerController.getAllApplications(req, res);
}));
router.post("/courses/:code/selected", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield lecturerController.selectApplication(req, res);
}));
router.get("/courses/:code/selected", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield lecturerController.getSelectedApplicationsByCourseCode(req, res);
}));
router.delete("/courses/:code/unselect", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield lecturerController.unselectApplication(req, res);
}));
router.patch("/courses/:code/demote", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield lecturerController.demoteSelectedApplication(req, res);
}));
router.patch("/courses/:code/promote", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield lecturerController.promoteSelectedApplication(req, res);
}));
router.get("/courses/:code/selected/:selectedApplicationId/comments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield lecturerController.getCommentsForSelection(req, res);
}));
router.post("/courses/:code/selected/comments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield lecturerController.addCommentToSelection(req, res);
}));
exports.default = router;
//# sourceMappingURL=lecturer.routes.js.map