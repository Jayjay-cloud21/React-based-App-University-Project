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
exports.LecturerController = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const Application_1 = require("../entity/Application");
const SelectedApplication_1 = require("../entity/SelectedApplication");
const Comment_1 = require("../entity/Comment");
class LecturerController {
    constructor() {
        this.applicationRepository = data_source_1.AppDataSource.getRepository(Application_1.Application);
        this.selectedApplicationRepository = data_source_1.AppDataSource.getRepository(SelectedApplication_1.SelectedApplication);
        this.commentRepository = data_source_1.AppDataSource.getRepository(Comment_1.Comment);
    }
    getApplicationsByCourseCode(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseCode = request.params.code;
                console.log("Course code:", courseCode);
                if (!courseCode) {
                    return response
                        .status(400)
                        .json({ message: "Course code is required" });
                }
                const applications = yield this.applicationRepository.find({
                    where: { courseCode: courseCode },
                    relations: ["user"],
                });
                return response.json(applications);
            }
            catch (error) {
                console.error("Error fetching applicants by course code:", error);
                return response.status(500).json({ message: "Internal server error" });
            }
        });
    }
    selectApplication(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseCode = request.params.code;
                const { applicationId } = request.body;
                // changed to applicationId, makes way more sense than userId
                // becuase users can apply twice for the same course
                // and we want to select the application, not the user
                console.log("Selecting application:", { courseCode, applicationId });
                // validaiton for required fields
                if (!courseCode) {
                    return response.status(400).json({
                        message: "Course code is required",
                    });
                }
                if (!applicationId) {
                    return response.status(400).json({
                        message: "Application ID is required",
                    });
                }
                // find the application
                const application = yield this.applicationRepository.findOne({
                    where: {
                        applicationId: applicationId,
                        courseCode: courseCode,
                    },
                    relations: ["user"],
                });
                if (!application) {
                    return response.status(404).json({
                        message: "Application not found for this course",
                    });
                }
                // check if it's already selected
                const existingSelection = yield this.selectedApplicationRepository.findOne({
                    where: {
                        applicationId: applicationId,
                    },
                });
                if (existingSelection) {
                    return response.status(400).json({
                        message: "Application is already selected for this course",
                    });
                }
                // set the rank to be the last preference in that course
                const existingSelectionsCount = yield this.selectedApplicationRepository
                    .createQueryBuilder("selectedApplication")
                    .innerJoin(Application_1.Application, "application", "selectedApplication.applicationId = application.applicationId")
                    .where("application.courseCode = :courseCode", { courseCode })
                    .getCount();
                const nextRank = existingSelectionsCount + 1;
                // update the application selected property to true
                application.selected = true;
                yield this.applicationRepository.save(application);
                // create the new record
                const selectedApplication = this.selectedApplicationRepository.create({
                    userId: application.userId,
                    applicationId: applicationId,
                    rank: nextRank,
                });
                const savedSelection = yield this.selectedApplicationRepository.save(selectedApplication);
                return response.status(201).json({
                    success: true,
                    data: savedSelection,
                    message: "Applicant selected successfully",
                });
            }
            catch (error) {
                console.error("Error selecting applicant:", error);
                return response.status(500).json({
                    message: "Internal server error",
                });
            }
        });
    }
    getSelectedApplicationsByCourseCode(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseCode = request.params.code;
                if (!courseCode) {
                    return response
                        .status(400)
                        .json({ message: "Course code is required" });
                }
                const selectedApplications = yield this.selectedApplicationRepository.find({
                    where: {
                        application: { courseCode: courseCode },
                    },
                    relations: ["application", "application.user"],
                    order: { rank: "ASC" },
                });
                return response.json(selectedApplications);
            }
            catch (error) {
                console.error("Error fetching selected applicants:", error);
                return response.status(500).json({
                    message: "Internal server error",
                });
            }
        });
    }
    demoteSelectedApplication(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseCode = request.params.code;
                const { applicationId } = request.body;
                if (!applicationId || !courseCode) {
                    return response.status(400).json({
                        message: "Application ID and course code are required",
                    });
                }
                // find the selected application to demote
                const selectedApplication = yield this.selectedApplicationRepository.findOne({
                    where: {
                        applicationId: applicationId,
                        application: { courseCode: courseCode },
                    },
                    relations: ["application"],
                });
                if (!selectedApplication) {
                    return response.status(404).json({
                        message: "Selected application not found",
                    });
                }
                // make sure the application to demote is not already at the bottom rank
                const currentRank = selectedApplication.rank;
                const bottomRankSelection = yield this.selectedApplicationRepository
                    .createQueryBuilder("selectedApplication")
                    .innerJoin(Application_1.Application, "application", "selectedApplication.applicationId = application.applicationId")
                    .where("application.courseCode = :courseCode", { courseCode })
                    .orderBy("selectedApplication.rank", "DESC")
                    .getOne();
                if (!bottomRankSelection || currentRank >= bottomRankSelection.rank) {
                    return response.status(400).json({
                        message: "Cannot demote: already at the lowest rank for this course",
                    });
                }
                // find the application to promote to the current rank
                const applicationToPromote = yield this.selectedApplicationRepository
                    .createQueryBuilder("selectedApplication")
                    .innerJoin(Application_1.Application, "application", "selectedApplication.applicationId = application.applicationId")
                    .where("application.courseCode = :courseCode", { courseCode })
                    .andWhere("selectedApplication.rank = :targetRank", {
                    targetRank: currentRank + 1,
                })
                    .getOne();
                if (!applicationToPromote) {
                    return response.status(404).json({
                        message: "No application found to promote",
                    });
                }
                // swap ranks
                selectedApplication.rank = currentRank + 1;
                applicationToPromote.rank = currentRank;
                // save both updated records
                yield this.selectedApplicationRepository.save([
                    selectedApplication,
                    applicationToPromote,
                ]);
                return response.json({
                    success: true,
                    data: {
                        demoted: {
                            applicationId: selectedApplication.applicationId,
                            newRank: selectedApplication.rank,
                            userId: selectedApplication.userId,
                        },
                        promoted: {
                            applicationId: applicationToPromote.applicationId,
                            newRank: applicationToPromote.rank,
                            userId: applicationToPromote.userId,
                        },
                    },
                    message: "Rank demoted successfully",
                });
            }
            catch (error) {
                console.error("Error demoting rank:", error);
                return response.status(500).json({
                    message: "Internal server error",
                });
            }
        });
    }
    promoteSelectedApplication(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseCode = request.params.code;
                const { applicationId } = request.body;
                if (!applicationId || !courseCode) {
                    return response.status(400).json({
                        message: "Application ID and course code are required",
                    });
                }
                // find the selected application to promote
                const selectedApplication = yield this.selectedApplicationRepository.findOne({
                    where: {
                        applicationId: applicationId,
                        application: { courseCode: courseCode },
                    },
                    relations: ["application"],
                });
                if (!selectedApplication) {
                    return response.status(404).json({
                        message: "Selected application not found",
                    });
                }
                // make sure the application to promote is not already at the top rank
                const currentRank = selectedApplication.rank;
                const topRankSelection = yield this.selectedApplicationRepository
                    .createQueryBuilder("selectedApplication")
                    .innerJoin(Application_1.Application, "application", "selectedApplication.applicationId = application.applicationId")
                    .where("application.courseCode = :courseCode", { courseCode })
                    .orderBy("selectedApplication.rank", "ASC")
                    .getOne();
                if (!topRankSelection || currentRank <= topRankSelection.rank) {
                    return response.status(400).json({
                        message: "Cannot promote: already at the top rank for this course",
                    });
                }
                // find the application to demote to the current rank
                const applicationToDemote = yield this.selectedApplicationRepository
                    .createQueryBuilder("selectedApplication")
                    .innerJoin(Application_1.Application, "application", "selectedApplication.applicationId = application.applicationId")
                    .where("application.courseCode = :courseCode", { courseCode })
                    .andWhere("selectedApplication.rank = :targetRank", {
                    targetRank: currentRank - 1,
                })
                    .getOne();
                if (!applicationToDemote) {
                    return response.status(404).json({
                        message: "No application found to demote",
                    });
                }
                // swap ranks
                selectedApplication.rank = currentRank - 1;
                applicationToDemote.rank = currentRank;
                // save both updated records
                yield this.selectedApplicationRepository.save([
                    selectedApplication,
                    applicationToDemote,
                ]);
                return response.json({
                    success: true,
                    data: {
                        promoted: {
                            applicationId: selectedApplication.applicationId,
                            newRank: selectedApplication.rank,
                            userId: selectedApplication.userId,
                        },
                        demoted: {
                            applicationId: applicationToDemote.applicationId,
                            newRank: applicationToDemote.rank,
                            userId: applicationToDemote.userId,
                        },
                    },
                    message: "Rank promoted successfully",
                });
            }
            catch (error) {
                console.error("Error promoting rank:", error);
                return response.status(500).json({
                    message: "Internal server error",
                });
            }
        });
    }
    addCommentToSelection(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseCode = request.params.code;
                const { selectedApplicationId, comment, userId } = request.body;
                if (!selectedApplicationId || !courseCode || !comment) {
                    return response.status(400).json({
                        message: "SelectedApplicationID, course code, and comment are required",
                    });
                }
                // make sure comment is not just whitespace or empty
                if (comment.trim().length === 0) {
                    return response.status(400).json({
                        message: "Comment cannot be empty",
                    });
                }
                // check if the user is a lecturer
                const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
                const lecturer = yield userRepository.findOne({
                    where: {
                        id: userId,
                        role: User_1.UserRole.LECTURER,
                    },
                });
                if (!lecturer) {
                    return response.status(404).json({
                        message: "Only lecturers can add comments to selections",
                    });
                }
                // find the application for which the comment is being added
                const selectedApplication = yield this.selectedApplicationRepository.findOne({
                    where: {
                        id: selectedApplicationId,
                        application: { courseCode: courseCode },
                    },
                });
                if (!selectedApplication) {
                    return response.status(404).json({
                        message: "Selected application not found for this course",
                    });
                }
                // create the comment
                const newComment = this.commentRepository.create({
                    selectedApplicationId: selectedApplication.id,
                    authorUserId: userId, // userId of the lecturer adding the comment
                    content: comment,
                });
                const savedComment = yield this.commentRepository.save(newComment);
                return response.status(201).json({
                    success: true,
                    data: {
                        commentId: savedComment.commentId,
                        selectedApplicationId: savedComment.selectedApplicationId,
                        authorUserId: savedComment.authorUserId,
                        content: savedComment.content,
                        createdAt: savedComment.createdAt,
                    },
                    message: "Comment added successfully",
                });
            }
            catch (error) {
                console.error("Error adding comment to selection:", error);
                return response.status(500).json({
                    message: "Internal server error",
                });
            }
        });
    }
    getCommentsForSelection(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const selectedApplicationId = Number(request.params.selectedApplicationId);
                if (isNaN(selectedApplicationId)) {
                    return response.status(400).json({
                        message: "Valid selected application ID is required",
                    });
                }
                const comments = yield this.commentRepository.find({
                    where: { selectedApplicationId: selectedApplicationId },
                });
                return response.json(comments);
            }
            catch (error) {
                console.error("Error fetching comments:", error);
                return response.status(500).json({
                    message: "Internal server error",
                });
            }
        });
    }
    unselectApplication(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseCode = request.params.code;
                const { applicationId } = request.body;
                if (!courseCode || !applicationId) {
                    return response.status(400).json({
                        message: "Course code and application ID are required",
                    });
                }
                // find the selected application
                const selectedApplication = yield this.selectedApplicationRepository.findOne({
                    where: {
                        applicationId: applicationId,
                        application: { courseCode: courseCode },
                    },
                });
                if (!selectedApplication) {
                    return response.status(404).json({
                        message: "Selected application not found for this course",
                    });
                }
                const removedRank = selectedApplication.rank;
                // delete all comments for this selected application first
                yield this.commentRepository.delete({
                    selectedApplicationId: selectedApplication.id,
                });
                // remove the selection
                yield this.selectedApplicationRepository.remove(selectedApplication);
                // set selected to false
                const application = yield this.applicationRepository.findOneBy({
                    applicationId: applicationId,
                });
                if (application) {
                    application.selected = false;
                    yield this.applicationRepository.save(application);
                }
                // need to adjust ranks for other selected applications in the same course after removing
                const applicationsToRerank = yield this.selectedApplicationRepository
                    .createQueryBuilder("selectedApplication")
                    .innerJoin(Application_1.Application, "application", "selectedApplication.applicationId = application.applicationId")
                    .where("application.courseCode = :courseCode", { courseCode })
                    .andWhere("selectedApplication.rank > :removedRank", {
                    removedRank,
                })
                    .getMany();
                // decrease rank by 1 for all applications with higher ranks
                for (const app of applicationsToRerank) {
                    app.rank = app.rank - 1;
                }
                // save all updated ranks
                if (applicationsToRerank.length > 0) {
                    yield this.selectedApplicationRepository.save(applicationsToRerank);
                }
                return response.json({
                    success: true,
                    message: "Application unselected successfully",
                });
            }
            catch (error) {
                console.error("Error unselecting application:", error);
                return response.status(500).json({
                    message: "Internal server error",
                });
            }
        });
    }
    getAllApplications(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const applications = yield this.applicationRepository.find({
                    relations: ["user", "course"],
                });
                return response.json(applications);
            }
            catch (error) {
                console.error("Error fetching all applications:", error);
                return response.status(500).json({ message: "Internal server error" });
            }
        });
    }
}
exports.LecturerController = LecturerController;
//# sourceMappingURL=LecturerController.js.map