import gql from "graphql-tag";

export const typeDefs = gql`
	type Course {
		code: String!
		name: String!
		startDate: String!
		endDate: String!
		description: String!
		lecturerId: Int
		lecturer: User
		createdAt: String!
		updatedAt: String!
	}

	type User {
		id: ID!
		firstName: String!
		lastName: String!
		email: String!
		role: String!
		password: String!
		isBlocked: Boolean!
		courses: [Course!]
		applications: [Application!]
		createdAt: String!
		updatedAt: String!
	}

	type Application {
		applicationId: Int!
		courseCode: String!
		availability: String!
		academicCredentials: String!
		previousRoles: String!
		skills: String!
		type: String!
		userId: Int!
		selected: Boolean!
		user: User
		course: Course
		createdAt: String!
		updatedAt: String!
	}

	type Query {
		# course queries
		courses: [Course!]!
		course(code: String!): Course

		# user queries
		candidates: [User!]!
		user(id: ID!): User
		lecturers: [User!]!
		unselectedCandidates: [User!]!
		candidatesWithManyApplications: [User!]!

		# application queries
		selectedApplicationsForCourse(courseCode: String!): [Application!]!
		getAllCourseSelections: [Application!]!
	}

	type AuthPayLoad {
		message: String
		success: Boolean!
		token: String
		user: User
	}

	type ActionToCourseResponse {
		message: String!
		success: Boolean!
	}

	type BlockUserResponse {
		message: String!
		success: Boolean!
	}

	type AddCourseResponse {
		message: String!
		success: Boolean!
		course: Course
	}

	type EditCourseResponse {
		message: String!
		success: Boolean!
		course: Course
	}

	type Mutation {
		# authentication
		login(email: String!, password: String!): AuthPayLoad

		# managing courses
		addCourse(
			code: String!
			name: String!
			startDate: String
			endDate: String
			description: String!
			lecturerId: Int
		): AddCourseResponse!

		editCourse(
			code: String!
			name: String
			startDate: String
			endDate: String
			description: String
			lecturerId: Int
		): EditCourseResponse!

		deleteCourse(courseCode: String!): ActionToCourseResponse!

		# assigning lecturers
		assignLecturerToCourse(courseCode: String!, lecturerId: ID!): Course!
		removeLecturerToCourse(courseCode: String!, lecturerId: ID!): Course!

		# user management
		blockUser(id: Int!): BlockUserResponse!
		unblockUser(id: Int!): BlockUserResponse!
	}
`;
