import React, { createContext, useContext, useState } from "react";
import { lecturerApi } from "@/services/lecturerApi";
import Comment from "@/types/comment";
import { SelectedApplication } from "@/types/selectedApplication";
import NewCourse from "@/types/newCourse";

interface LectContextType {
  selectingLoading: boolean;
  selectingError: string | null;
  rankingLoading: Record<string, boolean>;
  commentsLoading: boolean;
  addingCommentLoading: boolean;
  coursesLoading: boolean;
  coursesError: string | null;
  comments: Record<number, Comment[]>;
  selectApplication: (courseCode: string, applicationId: number) => Promise<boolean>;
  unSelectApplication: (courseCode: string, applicationId: number) => Promise<boolean>;
  promoteApplication: (courseCode: string, applicationId: number) => Promise<boolean>;
  demoteApplication: (courseCode: string, applicationId: number) => Promise<boolean>;
  addCommentToSelection: (courseCode: string, selectionId: number, content: string, authorUserId: number) => Promise<boolean>;
  fetchCommentsForApplication: (selectionId: number) => Promise<void>;
  fetchCoursesForLecturer: (lecturerId: number) => Promise<NewCourse[]>;
  fetchSelectedApplicationsByCourseCode: (courseCode: string) => Promise<SelectedApplication[]>;
  fetchAllSelectedApplications: (courses: NewCourse[]) => Promise<SelectedApplication[]>;
}

const LectContext = createContext<LectContextType | undefined>(undefined);

export function LectProvider({ children }: { children: React.ReactNode }) {
  const [selectingLoading, setSelectingLoading] = useState(false);
  const [selectingError, setSelectingError] = useState<string | null>(null);
  const [rankingLoading, setRankingLoading] = useState<Record<string, boolean>>({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [addingCommentLoading, setAddingCommentLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});

  const selectApplication = async (courseCode: string, applicationId: number): Promise<boolean> => {
    setSelectingLoading(true);
    setSelectingError(null);
    // call API function to select application
    try {
      const result = await lecturerApi.selectApplication(courseCode, applicationId);

      if (result.success) {
        return true;
      } else {
        setSelectingError(result.message || "Failed to select application");
        return false;
      }
    } catch (err) {
      console.error("Error selecting application:", err);
      setSelectingError("An unexpected error occurred");
      return false;
    } finally {
      setSelectingLoading(false);
    }
  };

  const unSelectApplication = async (courseCode: string, applicationId: number): Promise<boolean> => {
    setSelectingLoading(true);
    setSelectingError(null);

    // call API function to unselect application
    // has to delete all comments attached to the selection first
    try {
      const result = await lecturerApi.unselectApplication(courseCode, applicationId);

      if (result.success) {
        return true;
      } else {
        setSelectingError(result.message || "Failed to unselect application");
        return false;
      }
    } catch (err) {
      console.error("Error unselecting application:", err);
      setSelectingError("An unexpected error occurred");
      return false;
    } finally {
      setSelectingLoading(false);
    }
  };

  const promoteApplication = async (courseCode: string, applicationId: number): Promise<boolean> => {
    const loadingKey = `promote-${applicationId}`;
    setRankingLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const result = await lecturerApi.promoteSelectedApplication(courseCode, applicationId);

      if (result.success) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Error promoting application:", err);
      return false;
    } finally {
      setRankingLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const demoteApplication = async (courseCode: string, applicationId: number): Promise<boolean> => {
    const loadingKey = `demote-${applicationId}`;
    setRankingLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const result = await lecturerApi.demoteSelectedApplication(courseCode, applicationId);

      if (result.success) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Error demoting application:", err);
      return false;
    } finally {
      setRankingLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const addCommentToSelection = async (courseCode: string, selectionId: number, content: string, authorUserId: number): Promise<boolean> => {
    setAddingCommentLoading(true);

    try {
      const result = await lecturerApi.addCommentToSelection(
        courseCode,
        selectionId,
        content,
        authorUserId
      );

      if (result.success) {
        await fetchCommentsForApplication(selectionId);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      return false;
    } finally {
      setAddingCommentLoading(false);
    }
  };

  const fetchCommentsForApplication = async (selectionId: number): Promise<void> => {
    if (!selectionId) return;

    setCommentsLoading(true);
    try {
      const result = await lecturerApi.getCommentsForSelection(selectionId);

      if (result.success && result.data) {
        setComments(prev => ({
          ...prev,
          [selectionId]: result.data
        }));
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchCoursesForLecturer = async (lecturerId: number): Promise<NewCourse[]> => {
    if (!lecturerId) return [];

    setCoursesLoading(true);
    setCoursesError(null);

    try {
      const result = await lecturerApi.getCoursesForLecturer(lecturerId);

      if (result.success && result.data) {
        return result.data.data;
      } else {
        setCoursesError("Failed to fetch courses");
        return [];
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCoursesError("An unexpected error occurred");
      return [];
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchSelectedApplicationsByCourseCode = async (courseCode: string): Promise<SelectedApplication[]> => {
    try {
      const result = await lecturerApi.getSelectedApplicationsByCourseCode(courseCode);
      if (result.success && result.data) {
        return result.data;
      }
      return [];
    } catch (err) {
      console.error("Error fetching selected applications:", err);
      return [];
    }
  };

  const fetchAllSelectedApplications = async (courses: NewCourse[]): Promise<SelectedApplication[]> => {
    if (courses.length === 0) return [];

    try {
      const allSelected: SelectedApplication[] = [];
      for (const course of courses) {
        const result = await lecturerApi.getSelectedApplicationsByCourseCode(course.code);
        if (result.success && result.data) {
          allSelected.push(...result.data);
        }
      }
      return allSelected;
    } catch (err) {
      console.error("Error fetching all selected applications:", err);
      return [];
    }
  };

  const value = {
    selectingLoading,
    selectingError,
    rankingLoading,
    commentsLoading,
    addingCommentLoading,
    coursesLoading,
    coursesError,
    comments,
    selectApplication,
    unSelectApplication,
    promoteApplication,
    demoteApplication,
    addCommentToSelection,
    fetchCommentsForApplication,
    fetchCoursesForLecturer,
    fetchSelectedApplicationsByCourseCode,
    fetchAllSelectedApplications
  };

  return (
    <LectContext.Provider value={value}>
      {children}
    </LectContext.Provider>
  );
}

export const useLect = () => {
  const context = useContext(LectContext);
  if (!context) {
    throw new Error("useLect must be used within a LectProvider");
  }
  return context;
};