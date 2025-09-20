"use strict";
// code taken from Week 8 practical example
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
const Application_1 = require("../entity/Application");
const Course_1 = require("../entity/Course");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserController {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.applicationRepository = data_source_1.AppDataSource.getRepository(Application_1.Application);
        this.courseRepository = data_source_1.AppDataSource.getRepository(Course_1.Course);
    }
    /**
     * Retrieves all users from the database
     * @param request - Express request object
     * @param response - Express response object
     * @returns JSON response containing an array of all users
     */
    all(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.userRepository.find();
            return response.json(users);
        });
    }
    /**
     * Retrieves a single user by their ID
     * @param request - Express request object containing the user ID in params
     * @param response - Express response object
     * @returns JSON response containing the user if found, or 404 error if not found
     */
    one(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = parseInt(request.params.id);
            const user = yield this.userRepository.findOne({
                where: { id },
            });
            if (!user) {
                return response.status(404).json({ message: "User not found" });
            }
            return response.json(user);
        });
    }
    /**
     * Creates a new user in the database
     * @param request - Express request object containing user details in body
     * @param response - Express response object
     * @returns JSON response containing the created user or error message
     */
    // for the sign up page
    save(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName, email, password, role } = request.body;
            // validate required fields
            if (!firstName || !lastName || !email || !password || !role) {
                return response.status(400).json({
                    message: "Missing required fields. firstName, lastName, email, password, and role are required.",
                });
            }
            // make sure role is one of the allowed enum values
            if (!Object.values(User_1.UserRole).includes(role)) {
                return response.status(400).json({
                    message: `Invalid role. Must be one of: ${Object.values(User_1.UserRole).join(", ")}`,
                });
            }
            const existingUser = yield this.userRepository.findOne({
                where: { email },
            });
            if (existingUser) {
                return response.status(409).json({
                    message: "A user with this email already exists",
                });
            }
            const hash = yield bcryptjs_1.default.hash(password, 10);
            const user = Object.assign(new User_1.User(), {
                firstName,
                lastName,
                email,
                password: hash,
                role: role,
            });
            try {
                const savedUser = yield this.userRepository.save(user);
                return response.status(201).json(savedUser);
            }
            catch (error) {
                console.error("Error creating user:", error);
                return response.status(500).json({ message: "Internal server error" });
            }
        });
    }
    /**
     * Deletes a user from the database by their ID
     * @param request - Express request object containing the user ID in params
     * @param response - Express response object
     * @returns JSON response with success message or 404 error if user not found
     */
    remove(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = parseInt(request.params.id);
            const userToRemove = yield this.userRepository.findOne({
                where: { id },
            });
            if (!userToRemove) {
                return response.status(404).json({ message: "User not found" });
            }
            yield this.userRepository.remove(userToRemove);
            return response.json({ message: "User removed successfully" });
        });
    }
    /**
     * Updates an existing user's information
     * @param request - Express request object containing user ID in params and updated details in body
     * @param response - Express response object
     * @returns JSON response containing the updated user or error message
     */
    update(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = parseInt(request.params.id);
            const { firstName, lastName, email, age } = request.body;
            let userToUpdate = yield this.userRepository.findOne({
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
                const updatedUser = yield this.userRepository.save(userToUpdate);
                return response.json(updatedUser);
            }
            catch (error) {
                return response
                    .status(400)
                    .json({ message: "Error updating user", error });
            }
        });
    }
    /**
     * Authenticates a user with email and password
     * @param request - Express request object containing email and password in body
     * @param response - Express response object
     * @returns JSON response with user data and token if authentication succeeds
     */
    // for sign in page
    authenticate(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = request.body;
            if (!email || !password) {
                return response.status(400).json({
                    message: "Email and password are required",
                });
            }
            try {
                const user = yield this.userRepository.findOne({
                    where: { email },
                });
                if (!user) {
                    return response
                        .status(401)
                        .json({ message: "Invalid email or password" });
                }
                //check for encrypted password
                let isPasswordMatched = false;
                try {
                    isPasswordMatched = yield bcryptjs_1.default.compare(password, user.password);
                }
                catch (error) {
                    isPasswordMatched = false;
                }
                //check for static password (not encrypted)
                if (!isPasswordMatched) {
                    isPasswordMatched = password.trim() === user.password.trim();
                }
                if (!isPasswordMatched) {
                    return response.status(400).json({ message: "Incorrect password" });
                }
                // check if user is blocked
                if (user.isBlocked) {
                    return response.status(403).json({
                        message: "Your account has been blocked. Please contact support.",
                    });
                }
                const { password: _ } = user, userData = __rest(user, ["password"]);
                return response.json({
                    success: true,
                    user: userData,
                });
            }
            catch (error) {
                console.error("Error during authentication:", error);
                return response.status(500).json({ message: "Internal server error" });
            }
        });
    }
    /**
     * Stores the information of the candidates
     * @param request - Express request object containing user details in body
     * @param response - Express response object
     * @returns JSON response containing the updated candidate or error message
     */
    saveApplication(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, applicationId, academicCredentials, availability, previousRoles, skills, courseCode, type, selected, } = request.body;
                // check if required fields are missing
                if (!academicCredentials ||
                    !availability ||
                    !previousRoles ||
                    !skills ||
                    !type) {
                    return response.status(400).json({
                        message: "Fill all the required fields",
                    });
                }
                // find user
                const user = yield this.userRepository.findOne({
                    where: { id: userId },
                });
                if (!user) {
                    return response.status(404).json({
                        message: "User not found",
                    });
                }
                //find course based on code
                const course_ = yield this.courseRepository.findOne({
                    where: { code: courseCode },
                });
                if (!course_) {
                    return response.status(404).json({
                        message: "Course not found",
                    });
                }
                // Create application with proper field mapping
                const application = new Application_1.Application();
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
                const savedApplication = yield this.applicationRepository.save(application);
                console.log(savedApplication);
                return response.status(201).json({
                    message: "Profile saved successfully",
                    application: savedApplication,
                });
            }
            catch (error) {
                console.error("Error saving profile:", error);
                return response.status(500).json({
                    message: "Internal server error",
                    error: error.message,
                });
            }
        });
    }
    getProfilesByUserId(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(request.params.userId);
                if (!userId || isNaN(userId)) {
                    return response
                        .status(400)
                        .json({ message: "Valid user ID is required" });
                }
                // First check if the user exists
                const user = yield this.userRepository.findOne({
                    where: { id: userId },
                });
                if (!user) {
                    return response.status(404).json({ message: "User not found" });
                }
                // find applications that this user has submitted
                // and include the related courses and user information
                const applications = yield this.applicationRepository.find({
                    where: { user: { id: userId } },
                    relations: ["course", "user"], // include related courses and user
                });
                return response.json(applications);
            }
            catch (error) {
                console.error("Error fetching profiles by user ID:", error);
                return response.status(500).json({ message: "Internal server error" });
            }
        });
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map