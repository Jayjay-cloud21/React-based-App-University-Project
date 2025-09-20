import { AppDataSource } from "../../data-source";
import { Course } from "../../entity/Course";
import { User } from "../../entity/User";
import { Application } from "../../entity/Application";
import { SelectedApplication } from "../../entity/SelectedApplication"
import { In } from "typeorm";

// these are all the repositories needed
const courseRepository = AppDataSource.getRepository(Course);
const userRepository = AppDataSource.getRepository(User)
const applicationRepository = AppDataSource.getRepository(Application);
const selectedApplicationRepository = AppDataSource.getRepository(SelectedApplication);


export const courseResolvers = {
    Query: {
        courses: async() => {
            // query to get all courses
            const courses = await courseRepository.find();
            return courses;
        }
    },

    Mutation: {
        // method that assigns a lecturer to a specific course - only admins can do this
        assignLecturerToCourse: async(_: any,{courseCode, lecturerId} : {courseCode: string, lecturerId: string} ) => {
            const course = await courseRepository.findOne({ where: { code: courseCode } });

            // double check if course exists
            if (!course) {
                throw new Error(`Course with code ${courseCode} not found`);
            }

            if(course.lecturerId !== null) {
            const currentLecturer = await userRepository.findOne({ where: { id: course.lecturerId } });
            
            throw new Error(
                `This course is already assigned to ${currentLecturer?.firstName} ${currentLecturer?.lastName}.`
            );
        }

            // find the lecturer I want to assign
            const lecturer = await userRepository.findOne({ where: { id: parseInt(lecturerId) } });
            
            if (!lecturer) {
                throw new Error(`Lecturer with ID ${lecturerId} not found`);
            }
            
            // checks if we're actually assigning a lecturer and not a candidate
            if (lecturer.role !== 'Lecturer') {
                throw new Error(`User with ID ${lecturerId} is not a lecturer`);
            }

            
            course.lecturerId = parseInt(lecturerId);
            const updatedCourse = await courseRepository.save(course);
            return updatedCourse;
        },

        // method that deletes a course and all associated data
        deleteCourse: async(_: any, { courseCode }: { courseCode: string }) => {
            const course = await courseRepository.findOne({
                where: { code: courseCode } 
            });

            if (!course) {
                return {
                    message: "Course has already been deleted",
                    success: true,
                };
            }

            try {
                // since lecturer id is a foreign key to this table
                // I gotta remove the lecturer id first.
                if(course.lecturerId !== null) {
                    course.lecturerId = null;
                    await courseRepository.save(course);
                }

                // the find all applications for this course
                const applications = await applicationRepository.find({ 
                    where: { courseCode },
                    select: ["applicationId"]  
                });

                if (applications.length > 0) {
                    const applicationIds = applications.map(app => app.applicationId);
                    
                    // then I looked for the selected applicants
                    const selectedApplications = await selectedApplicationRepository.find({
                        where: { applicationId: In(applicationIds) },
                        select: ["id"]
                    });
                    
                    // I deleted the comments first due to foreign key constraints
                    if (selectedApplications.length > 0) {
                        const selectedApplicationIds = selectedApplications.map(app => app.id);
                        
                        const commentRepository = AppDataSource.getRepository("comment");
                        await commentRepository.delete({
                            selectedApplicationId: In(selectedApplicationIds)
                        });
                    }
                    
                    // now selected applications can be deleted
                    await selectedApplicationRepository.delete({ 
                        applicationId: In(applicationIds) 
                    });
                }
                    
                    // delete all applications for this course and finally delete the course itself
                    await applicationRepository.delete({ courseCode });
                    await courseRepository.delete({ code: courseCode });

                    return {
                        message: `Course ${courseCode} has been successfully deleted`,
                        success: true,
                    };
                } catch (error) {
                    console.error("Error deleting course:", error);
                    return {
                        message: `Failed to delete course: ${error}`,
                        success: false,
                };
            }
        },
        // adds a new course to the database
        addCourse: async(_: any, { code, name, startDate, endDate, description, lecturerId }: { 
            code: string, 
            name: string, 
            startDate: string, 
            endDate: string, 
            description: string,
            lecturerId?: string, 
            }) => {
            try {
                // check fi course already exists, since courseCodes must be unique
                const existingCourse = await courseRepository.findOne({
                where: { code }
                });

                if (existingCourse) {
                    return{
                        message: `Course with code ${code} already exists`,
                        success: false,
                        course: null
                    }
                }

                // make sure that the provided lecturer actually exists and a lecturer
                if (lecturerId) {
                const lecturer = await userRepository.findOne({ 
                    where: { id: parseInt(lecturerId) } 
                });

                    if (!lecturer) {
                        return {
                            message: `Lecturer with ID ${lecturerId} not found`,
                            success: false,
                            course: null
                        };
                    }

                    if (lecturer.role !== 'Lecturer') {
                        return {
                            message: `User with ID ${lecturerId} is not a lecturer`,
                            success: false,
                            course: null
                        };
                    }
                }

                // create and save the new course
                const newCourse = new Course();
                newCourse.code = code;
                newCourse.name = name;
                newCourse.startDate = startDate;
                newCourse.endDate = endDate;
                newCourse.description = description;
                
                // add lecturer if provided
                if (lecturerId) {
                newCourse.lecturerId = parseInt(lecturerId);
                }

                const savedCourse = await courseRepository.save(newCourse);
                 return {
                    message: `Course ${code} successfully created`,
                    success: true,
                    course: savedCourse
                };
            } catch (error) {
                console.error("Error adding course:", error);
                return {
                    message: `Failed to create course: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    success: false,
                    course: null
                };
            }
        },

        // update the existing course
        editCourse: async(_: any, { code, name, startDate, endDate, description, lecturerId }: { 
            code: string, 
            name?: string, 
            startDate?: string, 
            endDate?: string, 
            description?: string,
            lecturerId?: string | null
        }) => {
            try {
                // find the course first
                const course = await courseRepository.findOne({
                    where: { code }
                });

                if (!course) {
                    return {
                        message: `Course with code ${code} not found`,
                        success: false,
                        course: null
                    };
                }
                
                //only update the fields that are provided
                if (name !== undefined) course.name = name;
                if (startDate !== undefined) course.startDate = startDate;
                if (endDate !== undefined) course.endDate = endDate;
                if (description !== undefined) course.description = description;

                // this is to handle lecturer assignment/removal
                if (lecturerId !== undefined && lecturerId !== null) {
                    course.lecturerId = parseInt(lecturerId as string);
                } else {
                    course.lecturerId = null;
                }
                
                const updatedCourse = await courseRepository.save(course);
                
                return {
                    message: `Course ${code} successfully updated`,
                    success: true,
                    course: updatedCourse
                };
            } catch (error) {
                console.error("Error updating course:", error);
                return {
                    message: `Failed to update course: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    success: false,
                    course: null
                };
            }
        }
    }
};

