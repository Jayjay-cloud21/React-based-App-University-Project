// some code taken from the Week 8 practical example

import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entity/User";
import { Application } from "../entity/Application";
import { Course } from "../entity/Course";
import bcrypt from "bcryptjs";

export class UserController {
	private userRepository = AppDataSource.getRepository(User);
	private applicationRepository = AppDataSource.getRepository(Application);
	private courseRepository = AppDataSource.getRepository(Course);

	/**
	 * Retrieves all users from the database
	 * @param request - Express request object
	 * @param response - Express response object
	 * @returns JSON response containing an array of all users
	 */
	async all(request: Request, response: Response) {
		const users = await this.userRepository.find();

		return response.json(users);
	}

	/**
	 * Retrieves a single user by their ID
	 * @param request - Express request object containing the user ID in params
	 * @param response - Express response object
	 * @returns JSON response containing the user if found, or 404 error if not found
	 */
	async one(request: Request, response: Response) {
		const id = parseInt(request.params.id);
		const user = await this.userRepository.findOne({
			where: { id },
		});

		if (!user) {
			return response.status(404).json({ message: "User not found" });
		}
		return response.json(user);
	}

	/**
	 * Creates a new user in the database
	 * @param request - Express request object containing user details in body
	 * @param response - Express response object
	 * @returns JSON response containing the created user or error message
	 */ // for the sign up page
	async save(request: Request, response: Response) {
		try {
			const { firstName, lastName, email, password, role } = request.body;

			// validate required fields
			if (!firstName || !lastName || !email || !password || !role) {
				return response.status(400).json({
					message:
						"Missing required fields. firstName, lastName, email, password, and role are required.",
				});
			}

			// validate email format
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				return response.status(400).json({
					message: "Invalid email format",
				});
			}

			// validate password strength
			if (password.length < 8) {
				return response.status(400).json({
					message: "Password must be at least 8 characters long",
				});
			}

			if (!/[A-Z]/.test(password)) {
				return response.status(400).json({
					message: "Password must contain at least one uppercase letter",
				});
			}

			if (!/[a-z]/.test(password)) {
				return response.status(400).json({
					message: "Password must contain at least one lowercase letter",
				});
			}

			if (!/[0-9]/.test(password)) {
				return response.status(400).json({
					message: "Password must contain at least one digit",
				});
			}

			if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
				return response.status(400).json({
					message: "Password must contain at least one special character",
				});
			}

			// make sure role is one of the allowed enum values
			if (!Object.values(UserRole).includes(role)) {
				return response.status(400).json({
					message: `Invalid role. Must be one of: ${Object.values(
						UserRole
					).join(", ")}`,
				});
			}

			// check for user with the same email
			const existingUser = await this.userRepository.findOne({
				where: { email: email.toLowerCase().trim() },
			});

			if (existingUser) {
				return response.status(409).json({
					message: "A user with this email already exists",
				});
			}

			// hash password
			const hash = await bcrypt.hash(password, 10);

			// create user object
			const user = Object.assign(new User(), {
				firstName: firstName.trim(),
				lastName: lastName.trim(),
				email: email.toLowerCase().trim(),
				password: hash,
				role: role as UserRole,
			});

			const savedUser = await this.userRepository.save(user);

			// remov epassword from response for security reasons
			const { password: _, ...userResponse } = savedUser;

			return response.status(201).json(userResponse);
		} catch (error: any) {
			console.error("Error creating user:", error);
			return response.status(500).json({ message: "Internal server error" });
		}
	}

	/**
	 * Deletes a user from the database by their ID
	 * @param request - Express request object containing the user ID in params
	 * @param response - Express response object
	 * @returns JSON response with success message or 404 error if user not found
	 */
	async remove(request: Request, response: Response) {
		const id = parseInt(request.params.id);
		const userToRemove = await this.userRepository.findOne({
			where: { id },
		});

		if (!userToRemove) {
			return response.status(404).json({ message: "User not found" });
		}

		await this.userRepository.remove(userToRemove);
		return response.json({ message: "User removed successfully" });
	}

	/**
	 * Updates an existing user's information
	 * @param request - Express request object containing user ID in params and updated details in body
	 * @param response - Express response object
	 * @returns JSON response containing the updated user or error message
	 */
	async update(request: Request, response: Response) {
		const id = parseInt(request.params.id);
		const { firstName, lastName, email, age } = request.body;

		let userToUpdate = await this.userRepository.findOne({
			where: { id },
		});

		if (!userToUpdate) {
			return response.status(404).json({ message: "User not found" });
		}

		userToUpdate = Object.assign(userToUpdate, {
			firstName,
			lastName,
			email,
			age,
		});

		try {
			const updatedUser = await this.userRepository.save(userToUpdate);
			return response.json(updatedUser);
		} catch (error) {
			return response
				.status(400)
				.json({ message: "Error updating user", error });
		}
	}

	/**
	 * Authenticates a user with email and password
	 * @param request - Express request object containing email and password in body
	 * @param response - Express response object
	 * @returns JSON response with user data and token if authentication succeeds
	 */
	// for sign in page, checks if user exists and password matches
	async authenticate(request: Request, response: Response) {
		try {
			const { email, password } = request.body;

			if (!email || !password) {
				return response.status(400).json({
					message: "Email and password are required",
				});
			}

			// find user with  email search
			const user = await this.userRepository.findOne({
				where: { email: email.toLowerCase().trim() },
			});

			if (!user) {
				return response
					.status(401)
					.json({ message: "Invalid email or password" });
			}

			//check for encrypted password
			let isPasswordMatched = false;

			try {
				isPasswordMatched = await bcrypt.compare(password, user.password);
			} catch (error) {
				console.error("Error comparing passwords:", error);
				isPasswordMatched = false;
			}

			//check for plaintext password (not encrypted) - fallback for legacy data
			// would not keep this in a real application
			if (!isPasswordMatched) {
				isPasswordMatched = password.trim() === user.password.trim();
			}

			if (!isPasswordMatched) {
				return response
					.status(401)
					.json({ message: "Invalid email or password" });
			}

			// check if user is blocked
			if (user.isBlocked) {
				return response.status(403).json({
					message:
						"Your account has been blocked. Please contact support.",
				});
			}

			// remove password from response (security reasons)
			const { password: _, ...userData } = user;

			return response.json({
				success: true,
				user: userData,
			});
		} catch (error: any) {
			console.error("Error during authentication:", error);
			return response.status(500).json({
				message: "Internal server error",
				...(process.env.NODE_ENV === "development" && {
					error: error.message,
				}),
			});
		}
	}

	/**
	 * Stores the information of the candidates
	 * @param request - Express request object containing user details in body
	 * @param response - Express response object
	 * @returns JSON response containing the updated candidate or error message
	 */

	async saveApplication(request: Request, response: Response) {
		try {
			const {
				userId,
				applicationId,
				academicCredentials,
				availability,
				previousRoles,
				skills,
				courseCode,
				type,
				selected,
			} = request.body;

			// check if required fields are missing
			if (
				!academicCredentials ||
				!availability ||
				!previousRoles ||
				!skills ||
				!type
			) {
				return response.status(400).json({
					message: "Fill all the required fields",
				});
			}

			// find user
			const user = await this.userRepository.findOne({
				where: { id: userId },
			});

			if (!user) {
				return response.status(404).json({
					message: "User not found",
				});
			}

			//find course based on code
			const course_ = await this.courseRepository.findOne({
				where: { code: courseCode },
			});

			if (!course_) {
				return response.status(404).json({
					message: "Course not found",
				});
			}

			// Create application with proper field mapping
			const application = new Application();
			application.courseCode = courseCode;
			application.availability = availability;
			application.academicCredentials = academicCredentials;
			application.previousRoles = previousRoles;
			application.skills = skills;
			application.type = type;
			application.selected = false;
			application.user = user;
			application.course = course_;

			// save application
			const savedApplication = await this.applicationRepository.save(
				application
			);

			console.log(savedApplication);

			return response.status(201).json({
				message: "Profile saved successfully",
				application: savedApplication,
			});
		} catch (error: any) {
			console.error("Error saving profile:", error);
			return response.status(500).json({
				message: "Internal server error",
				error: error.message,
			});
		}
	}

	async getProfilesByUserId(request: Request, response: Response) {
		try {
			const userId = parseInt(request.params.userId);

			if (!userId || isNaN(userId)) {
				return response
					.status(400)
					.json({ message: "Valid user ID is required" });
			}

			// First check if the user exists
			const user = await this.userRepository.findOne({
				where: { id: userId },
			});

			if (!user) {
				return response.status(404).json({ message: "User not found" });
			}

			// find applications that this user has submitted
			// and include the related courses and user information
			const applications = await this.applicationRepository.find({
				where: { user: { id: userId } },
				relations: ["course", "user"], // include related courses and user
			});

			return response.json(applications);
		} catch (error) {
			console.error("Error fetching profiles by user ID:", error);
			return response.status(500).json({ message: "Internal server error" });
		}
	}
}
