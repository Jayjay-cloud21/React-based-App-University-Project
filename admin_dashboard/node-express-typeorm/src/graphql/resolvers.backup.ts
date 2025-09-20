// back up for resolvers file before we split them into multiple files
// not being used anymore
// Pet GraphQL example from week 9 or 10 has been used for reference

import { AppDataSource } from "../data-source";
import { Course } from "../entity/Course";
import { User } from "../entity/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "../entity/User";

const userRepository = AppDataSource.getRepository(User);
const courseRepository = AppDataSource.getRepository(Course);
const generateJWT = (user: User) => {
	const secret = process.env.JWT_SECRET || "your-secret-key";
	return jwt.sign(
		{ id: user.id, email: user.email, role: user.role },
		secret,
		{ expiresIn: "24h" }
	);
};

export const resolvers = {
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
	},

	Mutation: {
		login: async (
			_: any,
			{ email, password }: { email: string; password: string }
		) => {
			const user = await userRepository.findOne({ where: { email } });
			console.log(
				"User found:",
				user
					? `ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`
					: "null"
			);
			if (!user) {
				return {
					message: "No user found with this email",
					success: false,
					token: "",
					user: undefined,
				};
			}
			let passwordValid = false;

			if (user.role === UserRole.ADMIN && user.email === "admin") {
				passwordValid = password === user.password;

				if (passwordValid) {
					console.log(
						"WARNING: Admin using unhashed password - please update!"
					);
				}
			} else {
				passwordValid = await bcrypt.compare(password, user.password);
			}

			if (!passwordValid) {
				return {
					message: "Invalid email or password",
					success: false,
					token: "",
					user: undefined,
				};
			}
			if (user.role !== UserRole.ADMIN) {
				return {
					message: "Access denied. Only Administrators can log in here",
					success: false,
					token: "",
					user: undefined,
				};
			}

			const token = generateJWT(user);
			const success = true;
			const message = "Login successful";

			return {
				message,
				success,
				token,
				user,
			};
		},
	},
	//   Query: {
	//     profiles: async () => {
	//       return await profileRepository.find();
	//     },
	//     profile: async (_: any, { id }: { id: string }) => {
	//       return await profileRepository.findOne({
	//         where: { profile_id: parseInt(id) },
	//       });
	//     },
	//     pets: async () => {
	//       return await petRepository.find();
	//     },
	//     pet: async (_: any, { id }: { id: string }) => {
	//       return await petRepository.findOne({ where: { pet_id: parseInt(id) } });
	//     },
	//   },
	//   Mutation: {
	//     createProfile: async (_: any, args: any) => {
	//       const profile = profileRepository.create(args);
	//       return await profileRepository.save(profile);
	//     },
	//     updateProfile: async (
	//       _: any,
	//       { id, ...args }: { id: string } & Partial<Profile>
	//     ) => {
	//       await profileRepository.update(id, args);
	//       return await profileRepository.findOne({
	//         where: { profile_id: parseInt(id) },
	//       });
	//     },
	//     deleteProfile: async (_: any, { id }: { id: string }) => {
	//       const result = await profileRepository.delete(id);
	//       return result.affected !== 0;
	//     },
	//     createPet: async (_: any, { name }: { name: string }) => {
	//       const pet = petRepository.create({ name });
	//       return await petRepository.save(pet);
	//     },
	//     updatePet: async (_: any, { id, name }: { id: string; name: string }) => {
	//       await petRepository.update(id, { name });
	//       return await petRepository.findOne({ where: { pet_id: parseInt(id) } });
	//     },
	//     deletePet: async (_: any, { id }: { id: string }) => {
	//       const result = await petRepository.delete(id);
	//       return result.affected !== 0;
	//     },
	//     addPetToProfile: async (
	//       _: any,
	//       { profileId, petId }: { profileId: string; petId: string }
	//     ) => {
	//       const profile = await profileRepository.findOne({
	//         where: { profile_id: parseInt(profileId) },
	//         relations: ["pets"],
	//       });
	//       const pet = await petRepository.findOne({
	//         where: { pet_id: parseInt(petId) },
	//       });

	//       if (!profile || !pet) {
	//         throw new Error("Profile or Pet not found");
	//       }

	//       profile.pets = [...profile.pets, pet];
	//       return await profileRepository.save(profile);
	//     },
	//     removePetFromProfile: async (
	//       _: any,
	//       { profileId, petId }: { profileId: string; petId: string }
	//     ) => {
	//       const profile = await profileRepository.findOne({
	//         where: { profile_id: parseInt(profileId) },
	//         relations: ["pets"],
	//       });

	//       if (!profile) {
	//         throw new Error("Profile not found");
	//       }

	//       profile.pets = profile.pets.filter(
	//         (pet) => pet.pet_id !== parseInt(petId)
	//       );
	//       return await profileRepository.save(profile);
	//     },
	//   },
};
