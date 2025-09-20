import jwt from "jsonwebtoken";
import { User } from "../../entity/User";

export const generateJWT = (user: User): string => {
	const secret = process.env.JWT_SECRET || "your-secret-key";
	return jwt.sign(
		{ id: user.id, email: user.email, role: user.role },
		secret,
		{ expiresIn: "24h" }
	);
};
