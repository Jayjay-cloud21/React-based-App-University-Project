import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entity/User";
import { Application } from "../entity/Application";
import { SelectedApplication } from "../entity/SelectedApplication";
import { Comment } from "../entity/Comment";

export class LecturerController {
	private applicationRepository = AppDataSource.getRepository(Application);
	private selectedApplicationRepository =
		AppDataSource.getRepository(SelectedApplication);
	private commentRepository = AppDataSource.getRepository(Comment);

	// takes course code as input and then displays applications for that course
	async getApplicationsByCourseCode(request: Request, response: Response) {
		try {
			const courseCode = request.params.code;

			console.log("Course code:", courseCode);

			if (!courseCode) {
				return response
					.status(400)
					.json({ message: "Course code is required" });
			}

			const applications = await this.applicationRepository.find({
				where: { courseCode: courseCode },
				relations: ["user"],
			});

			return response.json(applications);
		} catch (error) {
			console.error("Error fetching applicants by course code:", error);
			return response.status(500).json({ message: "Internal server error" });
		}
	}

	async selectApplication(request: Request, response: Response) {
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
			const application = await this.applicationRepository.findOne({
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
			const existingSelection =
				await this.selectedApplicationRepository.findOne({
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
			const existingSelectionsCount =
				await this.selectedApplicationRepository
					.createQueryBuilder("selectedApplication")
					.innerJoin(
						Application,
						"application",
						"selectedApplication.applicationId = application.applicationId"
					)
					.where("application.courseCode = :courseCode", { courseCode })
					.getCount();

			const nextRank = existingSelectionsCount + 1;

			// update the application selected property to true
			application.selected = true;
			await this.applicationRepository.save(application);

			// create the new record
			const selectedApplication = this.selectedApplicationRepository.create({
				userId: application.userId,
				applicationId: applicationId,
				rank: nextRank,
			});

			const savedSelection = await this.selectedApplicationRepository.save(
				selectedApplication
			);

			return response.status(201).json({
				success: true,
				data: savedSelection,
				message: "Applicant selected successfully",
			});
		} catch (error) {
			console.error("Error selecting applicant:", error);
			return response.status(500).json({
				message: "Internal server error",
			});
		}
	}

	// returns only selected applications for a course
	async getSelectedApplicationsByCourseCode(
		request: Request,
		response: Response
	) {
		try {
			const courseCode = request.params.code;

			if (!courseCode) {
				return response
					.status(400)
					.json({ message: "Course code is required" });
			}

			const selectedApplications =
				await this.selectedApplicationRepository.find({
					where: {
						application: { courseCode: courseCode },
					},
					relations: ["application", "application.user"],
					order: { rank: "ASC" },
				});

			return response.json(selectedApplications);
		} catch (error) {
			console.error("Error fetching selected applicants:", error);
			return response.status(500).json({
				message: "Internal server error",
			});
		}
	}

	async demoteSelectedApplication(request: Request, response: Response) {
		try {
			const courseCode = request.params.code;
			const { applicationId } = request.body;

			if (!applicationId || !courseCode) {
				return response.status(400).json({
					message: "Application ID and course code are required",
				});
			}

			// find the selected application to demote
			const selectedApplication =
				await this.selectedApplicationRepository.findOne({
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

			const bottomRankSelection = await this.selectedApplicationRepository
				.createQueryBuilder("selectedApplication")
				.innerJoin(
					Application,
					"application",
					"selectedApplication.applicationId = application.applicationId"
				)
				.where("application.courseCode = :courseCode", { courseCode })
				.orderBy("selectedApplication.rank", "DESC")
				.getOne();

			if (!bottomRankSelection || currentRank >= bottomRankSelection.rank) {
				return response.status(400).json({
					message:
						"Cannot demote: already at the lowest rank for this course",
				});
			}

			// find the application to promote to the current rank
			const applicationToPromote = await this.selectedApplicationRepository
				.createQueryBuilder("selectedApplication")
				.innerJoin(
					Application,
					"application",
					"selectedApplication.applicationId = application.applicationId"
				)
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
			await this.selectedApplicationRepository.save([
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
		} catch (error) {
			console.error("Error demoting rank:", error);
			return response.status(500).json({
				message: "Internal server error",
			});
		}
	}

	async promoteSelectedApplication(request: Request, response: Response) {
		try {
			const courseCode = request.params.code;
			const { applicationId } = request.body;

			if (!applicationId || !courseCode) {
				return response.status(400).json({
					message: "Application ID and course code are required",
				});
			}

			// find the selected application to promote
			const selectedApplication =
				await this.selectedApplicationRepository.findOne({
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

			const topRankSelection = await this.selectedApplicationRepository
				.createQueryBuilder("selectedApplication")
				.innerJoin(
					Application,
					"application",
					"selectedApplication.applicationId = application.applicationId"
				)
				.where("application.courseCode = :courseCode", { courseCode })
				.orderBy("selectedApplication.rank", "ASC")
				.getOne();

			if (!topRankSelection || currentRank <= topRankSelection.rank) {
				return response.status(400).json({
					message:
						"Cannot promote: already at the top rank for this course",
				});
			}

			// find the application to demote to the current rank
			const applicationToDemote = await this.selectedApplicationRepository
				.createQueryBuilder("selectedApplication")
				.innerJoin(
					Application,
					"application",
					"selectedApplication.applicationId = application.applicationId"
				)
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
			await this.selectedApplicationRepository.save([
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
		} catch (error) {
			console.error("Error promoting rank:", error);
			return response.status(500).json({
				message: "Internal server error",
			});
		}
	}

	async addCommentToSelection(request: Request, response: Response) {
		try {
			const courseCode = request.params.code;
			const { selectedApplicationId, comment, userId } = request.body;

			if (!selectedApplicationId || !courseCode || !comment) {
				return response.status(400).json({
					message:
						"SelectedApplicationID, course code, and comment are required",
				});
			}

			// make sure comment is not just whitespace or empty
			if (comment.trim().length === 0) {
				return response.status(400).json({
					message: "Comment cannot be empty",
				});
			}

			// check if the user is a lecturer
			const userRepository = AppDataSource.getRepository(User);
			const lecturer = await userRepository.findOne({
				where: {
					id: userId,
					role: UserRole.LECTURER,
				},
			});

			if (!lecturer) {
				return response.status(404).json({
					message: "Only lecturers can add comments to selections",
				});
			}

			// find the application for which the comment is being added
			const selectedApplication =
				await this.selectedApplicationRepository.findOne({
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

			const savedComment = await this.commentRepository.save(newComment);

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
		} catch (error) {
			console.error("Error adding comment to selection:", error);
			return response.status(500).json({
				message: "Internal server error",
			});
		}
	}

	// show all previous comments made for a selected application
	async getCommentsForSelection(request: Request, response: Response) {
		try {
			const selectedApplicationId = Number(
				request.params.selectedApplicationId
			);

			if (isNaN(selectedApplicationId)) {
				return response.status(400).json({
					message: "Valid selected application ID is required",
				});
			}

			const comments = await this.commentRepository.find({
				where: { selectedApplicationId: selectedApplicationId },
			});

			return response.json(comments);
		} catch (error) {
			console.error("Error fetching comments:", error);
			return response.status(500).json({
				message: "Internal server error",
			});
		}
	}
	async unselectApplication(request: Request, response: Response) {
		try {
			const courseCode = request.params.code;
			const { applicationId } = request.body;

			if (!courseCode || !applicationId) {
				return response.status(400).json({
					message: "Course code and application ID are required",
				});
			}

			// find the selected application
			const selectedApplication =
				await this.selectedApplicationRepository.findOne({
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
			await this.commentRepository.delete({
				selectedApplicationId: selectedApplication.id,
			});

			// remove the selection
			await this.selectedApplicationRepository.remove(selectedApplication);

			// set selected to false
			const application = await this.applicationRepository.findOneBy({
				applicationId: applicationId,
			});

			if (application) {
				application.selected = false;
				await this.applicationRepository.save(application);
			}

			// need to adjust ranks for other selected applications in the same course after removing
			const applicationsToRerank = await this.selectedApplicationRepository
				.createQueryBuilder("selectedApplication")
				.innerJoin(
					Application,
					"application",
					"selectedApplication.applicationId = application.applicationId"
				)
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
				await this.selectedApplicationRepository.save(applicationsToRerank);
			}

			return response.json({
				success: true,
				message: "Application unselected successfully",
			});
		} catch (error) {
			console.error("Error unselecting application:", error);
			return response.status(500).json({
				message: "Internal server error",
			});
		}
	}

	async getAllApplications(request: Request, response: Response) {
		try {
			const applications = await this.applicationRepository.find({
				relations: ["user", "course"],
			});

			return response.json(applications);
		} catch (error) {
			console.error("Error fetching all applications:", error);
			return response.status(500).json({ message: "Internal server error" });
		}
	}
}
