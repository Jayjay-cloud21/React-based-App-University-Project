import { Flex, Box, Text, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { lecturerApi } from "@/services/lecturerApi";
import NewCourse from "../types/newCourse";

// courses component for the lecturer dashboard only
const Courses = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [courses, setCourses] = useState<NewCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoursesForLecturer = async () => {
      // check if user is logged in
      if (!currentUser?.id) {
        setError("No lecturer ID found");
        return;
      }
      setLoading(true);
      setError(null);

      try {
        // only fetch the courses assigned to the current lecturer
        const result = await lecturerApi.getCoursesForLecturer(currentUser.id);

        if (result.success && result.data) {
          setCourses(result.data.data);
        } else {
          setError(result.message || "Failed to fetch courses");
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchCoursesForLecturer();
    }
  }, [currentUser]);

  const handleCourseClick = (course: NewCourse) => {
    // navigate to the applications page for this course
    router.push({
      pathname: `/lecturer/[applicants]`,
      query: { applicants: course.code }
    }, `/lecturer/${course.code}`);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="300px">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="green.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }
  return (
    <Flex flexDirection={"column"} align={"center"} bg="gray.100" pt={10}>
      <Flex
        flexDirection="column"
        padding="20px"
        borderWidth="1px"
        borderRadius="lg"
        width="30%"
        mb="10"
        bg="white"
      >

        {courses.length === 0 ? (
          <Box textAlign="center" p={4}>
            <Text fontSize="lg" color="gray.500">
              No courses assigned to you yet.
            </Text>
            <Text fontSize="sm" color="gray.400" mt={2}>
              Please contact your administrator to assign courses.
            </Text>
          </Box>
        ) : (
          <>
            <Text fontSize="md" color="gray.600" mb={4} textAlign="center">
              Click on any course to view applicants
            </Text>
            {courses.map((course) => (
              <Box
                as="button"
                id={`course-${course.code}`}
                _hover={{
                  backgroundColor: "green.100",
                  transition: "background-color 0.3s",
                }}
                key={course.code}
                marginBottom="10px"
                padding="10px"
                borderWidth="1px"
                borderRadius="md"
                backgroundColor="green.50"
                onClick={() => {
                  handleCourseClick(course);
                }}
              >
                <Text fontSize="xl" fontWeight="bold">{course.code}</Text>
                <Text fontSize="lg" mt={1}>{course.name}</Text>
                <Text fontSize="md" mt={2} color="gray.600">{course.description}</Text>
                <Flex mt={3} justifyContent="space-between" flexWrap="wrap">
                  <Text fontSize="sm" color="gray.500">
                    Start: {new Date(course.startDate).toLocaleDateString()}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    End: {new Date(course.endDate).toLocaleDateString()}
                  </Text>
                </Flex>
              </Box>
            ))}
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default Courses;
