import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { UserRole } from "../../entity/User";
import { In } from "typeorm";

const userRepository = AppDataSource.getRepository(User);

export const userResolvers = {
	Query: {
		user: async (_: any, { id }: { id: string }) => {
			return await userRepository.findOne({
				where: { id: parseInt(id) },
				relations: ["courses"],
			});
		},
		lecturers: async () => {
			const lecturers = await userRepository.find({
				where: { role: UserRole.LECTURER },
				relations: ["courses"],
			});
			if (!lecturers) {
				return [];
			}
			return lecturers;
		},
		candidates: async () => {
			const candidates = await userRepository.find({
				where: { role: UserRole.CANDIDATE },
			});
			if (!candidates) {
				return [];
			}
			return candidates;
		},

		unselectedCandidates: async () => {
			// find candidates who have never been selected for any course
			// we join with applications where selected = true, then filter for users where this join returns nothing
			const unselectedCandidates = await userRepository
				.createQueryBuilder("user")
				.leftJoin(
					"user.applications",
					"application",
					"application.selected = true"
				)
				// also get all their applications and course details for display
				.leftJoinAndSelect("user.applications", "allApplications")
				.leftJoinAndSelect("allApplications.course", "course")
				.where("user.role = :role", { role: UserRole.CANDIDATE })
				// this finds users where no selected applications exist (the join returned nothing)
				.andWhere("application.applicationId IS NULL")
				.getMany();

			return unselectedCandidates;
		},
		candidatesWithManyApplications: async () => {
			// find candidates who got selected for more than 3 different courses
			// first get the user IDs of candidates with many selected applications
			const userIds = await userRepository
				.createQueryBuilder("user")
				// only look at selected applications
				.innerJoin(
					"user.applications",
					"application",
					"application.selected = true"
				)
				.where("user.role = :role", { role: UserRole.CANDIDATE })
				// group by user so we can count their applications
				.groupBy("user.id")
				// count distinct courses they were selected for, must be more than 3
				.having("COUNT(DISTINCT application.courseCode) > :count", {
					count: 3,
				})
				.select("user.id")
				.getRawMany();

			// extracting ids from the raw results
			const ids = userIds.map((result) => result.user_id);

			// if no users found, return empty array
			if (ids.length === 0) {
				return [];
			}

			// then fetching the user data with applications
			const candidates = await userRepository.find({
				where: {
					id: In(ids),
					role: UserRole.CANDIDATE,
				},
				relations: ["applications"],
			});

			return candidates;
		},
	},

	Mutation: {
		blockUser: async (_: any, { id }: { id: number }) => {
			// find the user by ID
			const user = await userRepository.findOne({ where: { id: id } });
			if (!user) {
				return {
					message: "User not found",
					success: false,
				};
			}
			// check if they're a candidate
			if (user.role === UserRole.CANDIDATE) {
				// check if they're already blocked
				if (user.isBlocked) {
					return {
						message: "User is already blocked",
						success: false,
					};
				}

				// if not, then set their isBlocked to true
				user.isBlocked = true;
				await userRepository.save(user);
			}

			return {
				message: `User ${user.firstName} ${user.lastName} has been blocked`,
				success: true,
			};
		},
		unblockUser: async (_: any, { id }: { id: number }) => {
			// same as above but vice versa
			const user = await userRepository.findOne({ where: { id: id } });
			if (!user) {
				return {
					message: "User not found",
					success: false,
				};
			}
			if (user.role === UserRole.CANDIDATE) {
				if (!user.isBlocked) {
					return {
						message: "User is not blocked",
						success: false,
					};
				}

				user.isBlocked = false;
				await userRepository.save(user);
			}
			return {
				message: `User ${user.firstName} ${user.lastName} has been unblocked`,
				success: true,
			};
		},
	},
};
