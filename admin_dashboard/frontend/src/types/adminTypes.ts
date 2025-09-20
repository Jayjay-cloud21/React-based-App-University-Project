export interface User {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	password: string;
	isBlocked: boolean;
	courses?: Course[];
	createdAt: string;
	updatedAt: string;
}

export interface Course {
	code: string;
	name: string;
	startDate: string;
	endDate: string;
	description: string;
	lecturerId?: number;
	lecturer?: User;
	createdAt: string;
	updatedAt: string;
}

export interface UsersQuery {
	users: User[];
}

export interface UserQuery {
	user: User | null;
}

export interface LecturersQuery {
	lecturers: User[];
}
