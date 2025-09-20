import { Application } from "../types/application";
import { api } from "./api";
import axios from 'axios';

export const candidateApi = {
    
    //get all profiles for a specific user
    getProfilesByUserId: async (userId: number) => {
        try {
            const response = await api.get(`/applications/user/${userId}`);
            return { success: true, data: response.data };
        } catch (error: unknown) {
            console.error("API error:", error);
            
            // used to safely access error properties
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Failed to fetch user",
                };
            }
            
            return {
                success: false,
                message: "An unexpected error occurred",
            };
        }
    },

    // get available courses
    getCourses: async () => {
        try {
            const response = await api.get("/courses");
            return { success: true, data: response.data };
        } catch (error: unknown) {
            console.error("API error:", error);
            
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Failed to fetch courses",
                };
            }
            
            return {
                success: false,
                message: "An unexpected error occurred",
            };
        }
    },

    // save application
    saveApplication: async (application: Application) => {
        try {
            const response = await api.post("/applications", application);
            return { success: true, data: response.data };
        } catch (error: unknown) {
            console.error("API error:", error);
            
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.message || "Failed to save application",
                };
            }
            
            return {
                success: false,
                message: "An unexpected error occurred",
            };
        }
    },
};
