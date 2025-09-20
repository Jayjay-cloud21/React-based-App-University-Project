import { AppDataSource } from "../../data-source";
import { User } from "../../entity/User";
import { UserRole } from "../../entity/User";
import bcrypt from "bcryptjs";
import { generateJWT } from "../utils/jwt";

const userRepository = AppDataSource.getRepository(User);

export const authResolvers = {
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
};
