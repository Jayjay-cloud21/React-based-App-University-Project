export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	isBlocked: boolean;
	createdAt?: string;
	updatedAt?: string;
	courses?: Course[];
	applications?: Application[];
}

export interface Course {
	code: string;
	name: string;
	startDate: Date;
	endDate: Date;
	description: string;
	lecturerId: number;
	lecturer?: User;
}

export interface Application {
	applicationId: number;
	courseCode: string;
	availability: string;
	academicCredentials: string;
	previousRoles: string;
	skills: string;
	type: string; // "Tutor" | "Lab Assistant"
	userId: number;
	selected: boolean;
	user?: User;
	course?: Course;
	createdAt?: Date;
	updatedAt?: Date;
}

export interface AuthPayload {
	message: string;
	success: boolean;
	token: string | undefined;
	user: User | undefined;
}

export enum UserRole {
	LECTURER = "Lecturer",
	CANDIDATE = "Candidate",
	ADMIN = "Admin",
}

export interface BlockUserResponse {
	message: string;
	success: boolean;
}

export interface ActionToCourseResponse {
	message: string;
	success: boolean;
}
export interface AddCourseResponse {
	message: string;
	success: boolean;
	course: Course;
}
export interface EditCourseResponse {
	message: string;
	success: boolean;
	course: Course
}
