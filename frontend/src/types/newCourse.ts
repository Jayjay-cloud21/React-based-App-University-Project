interface NewCourse {
	// the name is NewCourse because we used to have a type called Course in a1
	code: string;
	name: string;
	startDate: string;
	endDate: string;
	description: string;
	createdAt?: Date;
	updatedAt?: Date;
}

export default NewCourse;
