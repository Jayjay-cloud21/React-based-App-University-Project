import { gql } from "@apollo/client";

export const GET_CANDIDATES = gql`
	query getCandidates {
		candidates {
			id
			firstName
			lastName
			email
			isBlocked
		}
	}
`;

export const GET_USER = gql`
	query GetUser($id: ID!) {
		user(id: $id) {
			id
			firstName
			lastName
			email
			role
			isBlocked
			createdAt
			updatedAt
			courses {
				code
				name
				startDate
				endDate
				description
			}
		}
	}
`;

export const LOGIN = gql`
	mutation Login($email: String!, $password: String!) {
		login(email: $email, password: $password) {
			message
			success
			token
			user {
				id
				firstName
				lastName
				email
				role
				isBlocked
			}
		}
	}
`;

export const GET_LECTURERS = gql`
	query GetLecturers {
		lecturers {
			id
			firstName
			lastName
			email
			role
			courses {
				code
			}
		}
	}
`;

export const GET_COURSES = gql`
	query GetCourses {
		courses {
			code
			name
			startDate
			endDate
			description
			lecturerId
		}
	}
`;

export const ASSIGN_LECTURER = gql`
	mutation AssignLecture($courseCode: String!, $lecturerId: ID!) {
		assignLecturerToCourse(courseCode: $courseCode, lecturerId: $lecturerId) {
			code
			name
			startDate
			endDate
			lecturerId
		}
	}
`;

export const BLOCK_USER = gql`
	mutation BlockUser($id: Int!) {
		blockUser(id: $id) {
			message
			success
		}
	}
`;

export const UNBLOCK_USER = gql`
	mutation UnblockUser($id: Int!) {
		unblockUser(id: $id) {
			message
			success
		}
	}
`;

export const DELETE_COURSE = gql`
	mutation DeleteCourse($courseCode: String!) {
		deleteCourse(courseCode: $courseCode) {
			message
			success
		}
	}
`;

export const ADD_COURSE = gql`
	mutation AddCourse(
		$code: String!
		$name: String!
		$startDate: String!
		$endDate: String!
		$description: String!
		$lecturerId: Int
		) {
		addCourse(
			code: $code
			name: $name
			startDate: $startDate
			endDate: $endDate
			description: $description
			lecturerId: $lecturerId
		) {
			message
			success
			course {
				code
				name
				startDate
				endDate
				description
				lecturerId
			}
		}
	}
`;

export const EDIT_COURSE = gql`
	mutation EditCourse(
		$code: String!
		$name: String
		$startDate: String
		$endDate: String
		$description: String
		$lecturerId: Int
	) {
		editCourse(
			code: $code
			name: $name
			startDate: $startDate
			endDate: $endDate
			description: $description
			lecturerId: $lecturerId
		) {
			message
			success
			course {
				code
				name
				startDate
				endDate
				description
				lecturerId
			}
		}
	}
`;


// for admin reports
export const GET_SELECTED_APPLICATIONS_FOR_COURSE = gql`
	query SelectedApplicationsForCourse($courseCode: String!) {
		selectedApplicationsForCourse(courseCode: $courseCode) {
			applicationId
			courseCode
			availability
			academicCredentials
			previousRoles
			skills
			type
			userId
			selected
			user {
				firstName
				lastName
				email
				isBlocked
			}
		}
	}
`;

export const GET_ALL_COURSE_SELECTIONS = gql`
	query GetAllCourseSelections {
		getAllCourseSelections {
			applicationId
			courseCode
			availability
			academicCredentials
			previousRoles
			skills
			type
			userId
			selected
			user {
				id
				firstName
				lastName
				email
				isBlocked
			}
			course {
				name
			}
			createdAt
			updatedAt
		}
	}
`;

export const GET_UNSELECTED_CANDIDATES = gql`
	query GetUnselectedCandidates {
		unselectedCandidates {
			id
			firstName
			lastName
			email
			isBlocked
			applications {
				courseCode
				type
				selected
			}
		}
	}
`;

// returns candidates with more than 3 applications that have been selected
export const GET_CANDIDATES_WITH_MANY_APPLICATIONS = gql`
	query GetCandidatesWithManyApplications {
		candidatesWithManyApplications {
			id
			firstName
			lastName
			email
			role
			isBlocked
			applications {
				applicationId
				courseCode
				selected
				type
			}
		}
	}
`;
