import Header from "@/components/Header";
import {
  Container, 
  Heading, 
  VStack, 
  Flex,
  Text,
  useToast,
  Button,
  Box
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { userApi, Course, User, courseApi } from "@/services/api";
import Courses from "@/components/Courses";
import AdminAuth from "@/components/AdminAuth";
import { useRouter } from "next/router";

// error interface for structured errors
interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(error: unknown): ErrorWithMessage {
  if (isErrorWithMessage(error)) {
    return error;
  }

  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}

function getErrorMessage(error: unknown): string {
  return toErrorWithMessage(error).message;
}

const Index = () => {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const toast = useToast();
  const router = useRouter();
  
  // fetch courses and lecturers from the database
  const fetchData = async () => {
    try {
      const courses = await courseApi.courses();
      const lecturers = await userApi.lecturers();
      if(!courses) {
        setError("Failed to fetch courses from backend");
      } else {
        setCourses(courses);
      }

      if(lecturers) {
        setLecturers(lecturers);
      }
    } catch(error) {
      setError("An error occurred while fetching data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError("");
    setLoading(true);

    fetchData();
  }, []);

  // handles the addition of courses
  const handleAddCourse = async(newCourse: {
    code: string;
    name: string;
    startDate: string;
    endDate: string;
    description: string;
    lecturerId?: string;
  }) => {
    try {
      const response = await courseApi.addCourse(
        newCourse.code,
        newCourse.name,
        newCourse.startDate,
        newCourse.endDate,
        newCourse.description,
        newCourse.lecturerId ? parseInt(newCourse.lecturerId) : undefined
      );
      
      // toast to show that course is added successfully
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top"
      });
      // add the new course to the local state
        if (response.course) {
          setCourses(prev => [...prev, response.course]);
        } else {
          // if the server didn't return the course, refresh data
          fetchData();
        }
      } else {
        toast({
          title: "Error",
          description: response.message,
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top"
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getErrorMessage(error) || "Failed to add course",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top"
      });
    }
  };

  // handles the editing course part
  const handleEditCourse = async (
    courseCode: string,
    updatedCourse: {
      name: string;
      startDate: string;
      endDate: string;
      description: string;
      lecturerId?: string | null;
    }
  ) => {
    try {
      const response = await courseApi.editCourse(
        courseCode,
        updatedCourse.name,
        updatedCourse.startDate,
        updatedCourse.endDate,
        updatedCourse.description,
        updatedCourse.lecturerId ? parseInt(updatedCourse.lecturerId) : undefined
    );
    if (response.success) {
      // toast success message if edit is successfully done
      toast({
        title: "Success",
        description: response.message,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      // update the course in local state
      setCourses(prev => 
        prev.map(course => 
          course.code === courseCode 
            ? { 
                ...course, 
                name: updatedCourse.name,
                startDate: new Date(updatedCourse.startDate),
                endDate: new Date(updatedCourse.endDate),
                description: updatedCourse.description,
                lecturerId: updatedCourse.lecturerId ? parseInt(updatedCourse.lecturerId) : undefined
              } as Course
            : course
        )
      );
    } else {
      // toast error message
      toast({
        title: "Error",
        description: response.message,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top"
      });
    }
    } catch (error: unknown) {
      // toast message if edit course fails
      toast({
        title: "Error",
        description: getErrorMessage(error) || "Failed to update course",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top"
      });
    }
  }

  // handles the deletion of courses
  const handleDeleteCourse = async (courseCode: string) => {
    try {
      const response = await courseApi.deleteCourse(courseCode);

      // toast feature for showing that course id deleted successfully
      if(response.success) {
        toast({
          title: "Success",
          description: response.message,
          status: "success",
          duration: 1500,
          isClosable: true,
          position: "top"
        });

        // remoce the deleted course from local state
        setCourses(prev => prev.filter(course => course.code !== courseCode));
      } else {

        // to show other complications during course deletion
        toast({
          title: "Error",
          description: response.message,
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top"
        });
      }
    } catch (error: unknown) { 
      // to show that course is not deleted successfully
      toast({
        title: "Error",
        description: getErrorMessage(error) || "Failed to delete course",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top"
      });
    }

  };

  return ( 
    <>
    <AdminAuth>
      <Header/>
      
      <Flex direction="column" align="center" justify="center" minHeight="84vh" bg="gray.50">
        <Container maxW="container.md" py={8}>
          <VStack spacing={8} width="100%">
            <Box width="100%" mb={4}>
              <Button
                leftIcon={<ArrowBackIcon />}
                variant="outline"
                colorScheme="blue"
                onClick={() => router.push("/adminDashboard")}
              >
                Back to Dashboard
              </Button>
              </Box>
            <Heading as="h1" size="xl" textAlign="center" mb={6}>
              Course Management
            </Heading>
            {loading ? (
              <Text>Loading courses...</Text>
            ) : error ? (
              <Text color="red.500">{error}</Text>
            ) : (
              <Courses 
                courses={courses}
                lecturers={lecturers}
                onAddCourse={handleAddCourse}
                onEditCourse={handleEditCourse}
                onDeleteCourse={handleDeleteCourse}
              />
            )}
          </VStack>
        </Container>
      </Flex>
      <Footer />
    </AdminAuth>
    </>
  );
};

export default Index;