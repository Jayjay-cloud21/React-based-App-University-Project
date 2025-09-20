import React, { useContext, useState, createContext, useEffect } from "react";
import { Application } from "../types/application";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/router";
import { useToast } from "@chakra-ui/react";
import { candidateApi } from "../services/candidateApi";
import NewCourse from "../types/newCourse";

interface CandContextType {
    application: Application | null;
    isProfileSaved: boolean;
    candidateApplications: Application[] | null;
    courses: NewCourse[];
    loading: boolean;
    error: string | null;
    saveApplication: (application: Application) => Promise<{
        success: boolean;
        message: string;
    }>;
    fetchProfiles: () => Promise<void>;
    fetchCourses: () => Promise<void>;
    cancel: () => void;
    hasAppliedForCourse: (courseCode: string) => boolean;
    tutorApps: Application[];
    labApps: Application[];
}

const CandContext = createContext<CandContextType | undefined>(undefined);

export function CandContextProvider({ children }: { children: React.ReactNode }) {
    // get current user,
    const { currentUser } = useAuth();
    const router = useRouter();
    const toast = useToast();

    // state management
    const [application, setApplication] = useState<Application | null>(null);
    const [isProfileSaved, setIsProfileSaved] = useState<boolean>(false);
    const [candidateApplications, setCandidateApplications] = useState<Application[] | null>(null);
    const [courses, setCourses] = useState<NewCourse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [tutorApps, setTutorApps] = useState<Application[]>([]);
    const [labApps, setLabApps] = useState<Application[]>([]);



    // fetch cancdiate profile only when user changes
    useEffect(() => {
        if (currentUser) {
            fetchProfiles();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    useEffect(() => {
        fetchCourses();
    }, [router.pathname]);

    useEffect(() => {
    if (!candidateApplications || candidateApplications.length === 0) {
      return;
    }
    const tutorApp = candidateApplications?.filter(tutApp => (tutApp.type === "Tutor" && tutApp.user?.id === currentUser?.id))
    const labApp = candidateApplications?.filter(lApp => (lApp.type === "Lab Assistant" && lApp.user?.id === currentUser?.id))

    
    if (tutorApp) setTutorApps(tutorApp);
    if (labApp) setLabApps(labApp);
    }, [candidateApplications, currentUser]);

    // check if candidate created an application for both tutor and lab assistant type
    const hasAppliedForCourse = (courseCode: string) => {
    const hasTutorApps = tutorApps.some(t => t.courseCode === courseCode);
    const hasLabApps = labApps.some(l => l.courseCode === courseCode);
    return hasTutorApps && hasLabApps;
    };

    // fetch candidate profile from API
    const fetchProfiles = async () => {
        //if user is nbull, return
        if (!currentUser) return;

        setLoading(true);
        setError(null);

        try {
            const response = await candidateApi.getProfilesByUserId(currentUser.id || 0);
            if (response.success) {
                setCandidateApplications(response.data);
            } else {
                setError(response.message || "Failed to fetch profiles");
                setCandidateApplications([]);
            }
        } catch (error) {
            console.error("Error fetching candidate profiles:", error);
            setError("An unexpected error occurred while fetching profiles");
            setCandidateApplications([]);
        } finally {
            setLoading(false);
        }
    };

    //fetch avail courses from API
    const fetchCourses = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await candidateApi.getCourses();
            if (response.success) {
                setCourses(response.data);
            } else {
                setError(response.message || "Failed to fetch courses");
                setCourses([]);
            }
        } catch (err) {
            console.error("Error fetching courses:", err);
            setError("An unexpected error occurred while fetching courses");
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };


    // save profile function
    const saveApplication = async (application: Application) => {
        if (!currentUser) {
            return { success: false, message: "You must be logged in to apply" };
        }
        setLoading(true);
        setError(null);
        try {
            // combine current user data with application data
            const completeApplication = {
                ...application,
                userId: currentUser.id
            };

            // save to database via API
            const response = await candidateApi.saveApplication(completeApplication);

            if (response.success) {
                setApplication(response.data);
                setIsProfileSaved(true);

                // refresh profiles list
                await fetchProfiles();

                toast({
                    title: "Application Submitted",
                    description: "Your application has been saved successfully.",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                    position: "top",
                });

                router.push("/candidate");
                return { success: true, message: "Profile saved successfully" };
            } else {
                setError(response.message || "Failed to save profile");
                toast({
                    title: "Application Failed",
                    description: response.message || "Failed to save your application.",
                    status: "error",
                    duration: 2000,
                    isClosable: true,
                    position: "top",
                });
                return { success: false, message: response.message || "Failed to save profile" };
            }
        } catch (err: unknown) {
            let errorMsg = "An unexpected error occurred";
            
            if (err instanceof Error) {
                errorMsg = err.message;
            } else if (typeof err === 'object' && err !== null && 'message' in err) {
                errorMsg = (err as { message: string }).message;
            }
            
            console.error("Error saving profile:", err);
            setError(errorMsg);
            toast({
                title: "Application Failed",
                description: errorMsg,
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "top",
            });
            return { success: false, message: errorMsg };
        } finally {
            setLoading(false);
        }
    };


    // cancel application
    const cancel = () => {
        router.push("./");
        toast({
            title: "Application Cancelled",
            description: "You have cancelled your application",
            status: "info",
            duration: 2000,
            isClosable: true,
            position: "top",
        });
    };

    const value = {
        application,
        isProfileSaved,
        candidateApplications,
        courses,
        loading,
        error,
        tutorApps,
        labApps,
        hasAppliedForCourse,
        saveApplication,
        fetchProfiles,
        fetchCourses,
        cancel,
    };
    return <CandContext.Provider value={value}>{children}</CandContext.Provider>
}


export const useCand = () => {
    const context = useContext(CandContext);

    if (context === undefined) {
        throw new Error("useCand must be used within  a CandContextProvider")
    };

    return context;
}
