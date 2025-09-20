import NewCourse from "./newCourse";
import NewUser from "./newUser";

export interface Application extends NewUser {
	applicationId?: number;
	academicCredentials: string;
	availability: "Full Time" | "Part Time";
	previousRoles: string;
	skills: string;
	courseCode: string;
	type: "Tutor" | "Lab Assistant";
	selected: boolean;
	user?: NewUser; // included for when querying applications and we want to fetch the user details as well
	course?: NewCourse; // same principle but for course details
}
