import { api } from "./api";
import NewCourse from "../types/newCourse";
import { Application } from "@/types/application";
import axios from "axios";

export const lecturerApi = {
	getCoursesForLecturer: async (lecturerId: number) => {
		try {
			const response = await api.get<{
				success: boolean;
				data: NewCourse[];
				message: string;
			}>(`/courses/lecturer/${lecturerId}`);

			// extract data array from wrapper
			if (response.data) {
				return { success: true, data: response.data };
			} else {
				return {
					success: false,
					message: "Failed to fetch courses",
				};
			}
		} catch (error: unknown) {
            console.error("API error:", error);
            
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Failed to fetch courses for lecturer",
                };
            }
            
            return {
                success: false,
                message: "An unexpected error occurred",
            };
        }
	},
	getApplicationsByCourseCode: async (courseCode: string) => {
		try {
			const response = await api.get<Application[]>(
				`/courses/${courseCode}/applications`
			);

			return {
				success: true,
				data: response.data || [],
			};
		} catch (error: unknown) {
            console.error("API error:", error);
            
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Failed to fetch applications for course",
                };
            }
            
            return {
                success: false,
                message: "An unexpected error occurred",
            };
        }
	},
	getAllApplications: async () => {
		try {
			const response = await api.get<Application[]>("/applications");

			return {
				success: true,
				data: response.data || [],
			};
		} catch (error: unknown) {
            console.error("API error:", error);
            
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Failed to fetch all applications",
                };
            }
            
            return {
                success: false,
                message: "An unexpected error occurred",
            };
        }
	},
	selectApplication: async (courseCode: string, applicationId: number) => {
		try {
			const response = await api.post(`/courses/${courseCode}/selected`, {
				applicationId,
			});

			return {
				success: true,
				data: response.data,
				message: "Application selected successfully",
			};
		} catch (error: unknown) {
            console.error("API error:", error);
            
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Failed to select application",
                };
            }
            
            return {
                success: false,
                message: "An unexpected error occurred",
            };
        }
	},
	getSelectedApplicationsByCourseCode: async (courseCode: string) => {
		try {
			const response = await api.get(`/courses/${courseCode}/selected`);
			return {
				success: true,
				data: response.data,
			};
		} catch (error: unknown) {
            console.error("API error:", error);
            
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Failed to fetch selected applications",
                };
            }
            
            return {
                success: false,
                message: "An unexpected error occurred",
            };
        }
	},
	unselectApplication: async (courseCode: string, applicationId: number) => {
		try {
			const response = await api.delete(`/courses/${courseCode}/unselect`, {
				data: { applicationId },
			});
			return {
				success: true,
				message:
					response.data.message || "Application unselected successfully",
			};
		} catch (error: unknown) {
            console.error("API error:", error);
            
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Failed to unselect application",
                };
            }
            
            return {
                success: false,
                message: "An unexpected error occurred",
            };
        }
	},
	promoteSelectedApplication: async (
		courseCode: string,
		applicationId: number
	) => {
		try {
			const response = await api.patch(`/courses/${courseCode}/promote`, {
				applicationId,
			});
			return {
				success: true,
				data: response.data.data,
				message:
					response.data.message || "Application promoted successfully",
			};
		} catch (error: unknown) {
            console.error("API error:", error);
            
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Failed to promote application",
                };
            }
            
            return {
                success: false,
                message: "An unexpected error occurred",
            };
        }
	},
	demoteSelectedApplication: async (
		courseCode: string,
		applicationId: number
	) => {
		try {
			const response = await api.patch(`/courses/${courseCode}/demote`, {
				applicationId,
			});
			return {
				success: true,
				data: response.data.data,
				message:
					response.data.message || "Application demoted successfully",
			};
		} catch (error: unknown) {
            console.error("API error:", error);
            
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Failed to demote application",
                };
            }
            
            return {
                success: false,
                message: "An unexpected error occurred",
            };
        }
	},
	addCommentToSelection: async (
		courseCode: string,
		selectedApplicationId: number,
		comment: string,
		userId: number
	) => {
		try {
			const response = await api.post(
				`/courses/${courseCode}/selected/comments`,
				{
					selectedApplicationId,
					comment,
					userId,
				}
			);
			return {
				success: true,
				data: response.data.data,
				message: response.data.message || "Comment added successfully",
			};
		} catch (error: unknown) {
            console.error("API error:", error);
            
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Failed to add comment",
                };
            }
            
            return {
                success: false,
                message: "An unexpected error occurred",
            };
        }
	},
	getCommentsForSelection: async (selectedApplicationId: number) => {
		try {
			const response = await api.get(
				`/courses/:code/selected/${selectedApplicationId}/comments`
			);
			return {
				success: true,
				data: response.data,
			};
		} catch (error: unknown) {
            console.error("API error:", error);
            
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Failed to fetch comments",
                };
            }
            
            return {
                success: false,
                message: "An unexpected error occurred",
            };
        }
	},
};
