import { Flex, Box, Text, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCand } from "@/context/CandidateContext";
import NewCourse from "../types/newCourse";

interface CoursesProps {
  destination: string;
}

const Courses: React.FC<CoursesProps> = ({ destination }: CoursesProps) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { courses, loading, error, fetchCourses, fetchProfiles, hasAppliedForCourse } = useCand();

  useEffect(() => {

    fetchCourses();
    // if user is logged in, load their profiles to check which profile they applied for
    if (currentUser) {
      fetchProfiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleCourseClick = (course: NewCourse) => {
    if (destination === "lecturer") {
      // not in use anymore, Lecturer dashboard no longer uses this component to display courses
      router.push({
        pathname: `/lecturer/[applicants]`,
        query: { applicants: course.code }
      }, `/lecturer/${course.code}`);
    } else {
      // candidates, redirect to the application form page
      router.push({
        pathname: `${destination}/[form]`,
        query: { form: 'form', courseCode: course.code }
      }, `${destination}/form?courseCode=${course.code}`);
    }
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
        {destination === "lecturer" && (
          <Text fontSize="md" color="gray.600" mb={4} textAlign="center">
            Click on any course to view applicants
          </Text>
        )}
        {courses.map((course) => {
          const alreadyApplied = hasAppliedForCourse(course.code);

          return (<Box
            as="button"
            id={`course-${course.code}`}
            _hover={{
              backgroundColor: (destination !== "lecturer" && !alreadyApplied) || destination === "lecturer" ? "green.100" : undefined,
              transition: "background-color 0.3s",
            }}
            key={course.code}
            marginBottom="10px"
            padding="10px"
            borderWidth="1px"
            borderRadius="md"
            backgroundColor="green.50"
            onClick={() => {
              if (destination === "lecturer" || !alreadyApplied) {
                handleCourseClick(course);
              }
            }}
            opacity={destination === "lecturer" ? 1 : (alreadyApplied ? 0.7 : 1)}
            cursor={destination === "lecturer" ? "pointer" : (alreadyApplied ? "not-allowed" : "pointer")}
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
            {alreadyApplied && destination !== "lecturer" && (
              <Text fontSize="sm" color="red.500" fontWeight="semibold">
                Application Submitted
              </Text>
            )}
          </Box>
          );
        })}
      </Flex>
    </Flex>
  );
};

export default Courses;
