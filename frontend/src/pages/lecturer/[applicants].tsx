import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  Box,
  Flex,
  Text,
  UnorderedList,
  ListItem,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Badge,
  Button,
  useToast,
  Grid,
  Tooltip,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
} from "@chakra-ui/react";
import { CheckCircleIcon, InfoIcon } from "@chakra-ui/icons";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import LecturerAuth from "@/components/LecturerAuth";
import { Application } from "@/types/application";
import { lecturerApi } from "@/services/lecturerApi";
import { useAuth } from "@/context/AuthContext";
import { useLect } from "@/context/LectContext";
import NewCourse from "@/types/newCourse";

const navLinks = [
  { label: "Dashboard", href: "/lecturer" },
  { label: "Selected Applications", href: "/lecturer/selected" },
  { label: "Search Applications", href: "/lecturer/searchTutors" },
];

const Applications = () => {
  const router = useRouter();
  const { applicants } = router.query;
  const courseCode = applicants as string;
  const { currentUser } = useAuth();
  const {
    selectApplication,
    selectingLoading,
    selectingError,
    unSelectApplication,
  } = useLect();
  const toast = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<NewCourse[]>([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);

  useEffect(() => {
    const fetchCoursesForLecturer = async () => {
      // make sure user is logged in, if not then redirect to sign in page
      if (!currentUser?.id) {
        setError("No lecturer ID found");
        router.push("/signin");
        return;
      }

      try {
        // fetch courses assigned to the current lecturer
        // this is for checking if the lecturer has access to the course
        const result = await lecturerApi.getCoursesForLecturer(
          currentUser.id
        );

        if (result.success && result.data) {
          setCourses(result.data.data);
          setCoursesLoaded(true);
        } else {
          setError(result.message || "Failed to fetch courses");
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("An unexpected error occurred");
      }
    };

    if (currentUser?.id && !coursesLoaded) {
      fetchCoursesForLecturer();
    }
  }, [currentUser?.id, coursesLoaded, router]);

  // check if lecturer has access to this course
  useEffect(() => {
    if (coursesLoaded && courseCode && courses.length > 0) {
      const hasAccess = courses.some(course => course.code === courseCode);
      if (!hasAccess) {
        setError("Lecturer not assigned to this course");
        router.push("/lecturer"); // redirect to lecturer dashboard if not
        return;
      }
    }
  }, [coursesLoaded, courseCode, courses, router]);

  useEffect(() => {
    const fetchApplicationsByCourseCode = async () => {
      if (!courseCode) {
        setError("No course code provided");
        return;
      }

      // only fetch applications if lecturer has access to the course
      const hasAccess = courses.some(course => course.code === courseCode);
      if (!hasAccess && coursesLoaded) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await lecturerApi.getApplicationsByCourseCode(
          courseCode
        );

        if (result.success && result.data) {
          setApplications(result.data);
        } else {
          setError(result.message || "Failed to fetch applications");
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (courseCode && currentUser?.role === "Lecturer" && coursesLoaded) {
      fetchApplicationsByCourseCode();
    }
  }, [courseCode, currentUser?.role, coursesLoaded, courses]);

  const handleSelectApplication = async (applicationId: number) => {
    if (!courseCode || !applicationId) return;

    const success = await selectApplication(courseCode, applicationId);

    // show toast for feedback
    if (success) {
      toast({
        title: "Application Selected",
        description: "The application has been successfully selected.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // refresh applications list
      const result = await lecturerApi.getApplicationsByCourseCode(
        courseCode
      );
      if (result.success && result.data) {
        setApplications(result.data);
      }
    } else {
      toast({
        title: "Selection Failed",
        description: selectingError || "Failed to select application.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeselectApplication = async (applicationId: number) => {
    if (!courseCode || !applicationId) return;

    const success = await unSelectApplication(courseCode, applicationId);
    if (success) {
      toast({
        title: "Application Deselected",
        description: "The application has been successfully deselected.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // refresh applications list
      const result = await lecturerApi.getApplicationsByCourseCode(
        courseCode
      );
      if (result.success && result.data) {
        setApplications(result.data);
      }
    } else {
      toast({
        title: "Deselection Failed",
        description: selectingError || "Failed to deselect application.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <LecturerAuth>
        <Header navLinks={navLinks} />
        <Flex
          direction="column"
          align="center"
          justify="space-between"
          minHeight="100vh"
          bg="gray.100"
        >
          <Flex
            direction="column"
            align="center"
            justify="center"
            px={4}
            py={6}
          >
            <Text
              fontSize="4xl"
              fontWeight="bold"
              mb={4}
              textAlign="center"
            >
              Applicants for {applicants}
            </Text>
            <Text mb={6}>
              Review and select qualified candidates to tutor this
              course.
            </Text>

            {!loading && !error && applications.length > 0 && (
              <Box
                width="100%"
                maxWidth="1000px"
                bg="white"
                p={4}
                mb={6}
                borderRadius="md"
                boxShadow="sm"
              >
                <Text fontSize="lg" fontWeight="bold" mb={3}>
                  Application Status Overview
                </Text>
                <StatGroup mb={4}>
                  <Stat>
                    <StatLabel>Total Applications</StatLabel>
                    <StatNumber>{applications.length}</StatNumber>
                    <StatHelpText>
                      All applicants for this course
                    </StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Most Chosen Candidates</StatLabel>
                    <StatNumber color="green.500">
                      {
                        applications.filter((app) => app.selected)
                          .length
                      }
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>
                      Least Chosen / Not Chosen Candidates
                    </StatLabel>
                    <StatNumber color="gray.500">
                      {
                        applications.filter((app) => !app.selected)
                          .length
                      }
                    </StatNumber>
                  </Stat>
                </StatGroup>
                <Box mt={4}>
                  <Text fontSize="md" fontWeight="medium" mb={2}>
                    Visual Status Distribution
                  </Text>
                  <Flex
                    width="100%"
                    height="20px"
                    bg="gray.100"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    {applications.filter((app) => app.selected)
                      .length > 0 && (
                        <Box
                          height="100%"
                          width={`${(applications.filter(
                            (app) => app.selected
                          ).length /
                            applications.length) *
                            100
                            }%`}
                          bg="green.400"
                          transition="width 0.5s ease-in-out"
                        />
                      )}
                    {applications.filter((app) => !app.selected)
                      .length > 0 && (
                        <Box
                          height="100%"
                          width={`${(applications.filter(
                            (app) => !app.selected
                          ).length /
                            applications.length) *
                            100
                            }%`}
                          bg="gray.300"
                          transition="width 0.5s ease-in-out"
                        />
                      )}
                  </Flex>
                  <Flex mt={2} justify="space-between">
                    <Box>
                      <Badge colorScheme="green" mr={2}>
                        ■
                      </Badge>
                      <Text as="span" fontSize="sm">
                        Most Chosen Candidates (
                        {
                          applications.filter(
                            (app) => app.selected
                          ).length
                        }
                        )
                      </Text>
                    </Box>
                    <Box>
                      <Badge colorScheme="gray" mr={2}>
                        ■
                      </Badge>
                      <Text as="span" fontSize="sm">
                        Least Chosen / Not Chosen Candidates (
                        {
                          applications.filter(
                            (app) => !app.selected
                          ).length
                        }
                        )
                      </Text>
                    </Box>
                  </Flex>
                </Box>

                {applications.filter((app) => app.selected).length >
                  0 && (
                    <Box mt={4} p={3} bg="green.50" borderRadius="md">
                      <Flex align="center" mb={2}>
                        <CheckCircleIcon color="green.500" mr={2} />
                        <Text fontWeight="medium">
                          Most Chosen Candidates:
                        </Text>
                      </Flex>
                      <UnorderedList pl={6}>
                        {applications
                          .filter((app) => app.selected)
                          .map((app) => (
                            <ListItem
                              key={app.applicationId}
                              fontSize="sm"
                            >
                              {app.user?.firstName}{" "}
                              {app.user?.lastName} ({app.type})
                            </ListItem>
                          ))}
                      </UnorderedList>
                    </Box>
                  )}

                <Box mt={4} p={3} bg="blue.50" borderRadius="md">
                  <Flex align="center">
                    <InfoIcon color="blue.500" mr={2} />
                    <Text fontSize="sm">
                      Since there is one lecturer per course,
                      applications can only be either selected or not
                      selected. Use the cards below to manage your
                      selections.
                    </Text>
                  </Flex>
                </Box>
              </Box>
            )}

            <Box width="100%" maxWidth="1200px">
              {loading && (
                <Flex justify="center" align="center" height="200px">
                  <Spinner
                    size="xl"
                    thickness="4px"
                    speed="0.65s"
                    color="green.500"
                  />
                </Flex>
              )}

              {error && (
                <Alert status="error" borderRadius="md" mb={4}>
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              {!loading && !error && applications.length === 0 && (
                <Box textAlign="center" p={8}>
                  <Text fontSize="lg" color="gray.500">
                    No applications found for this course.
                  </Text>
                  <Text fontSize="sm" color="gray.400" mt={2}>
                    No one has applied for this course yet.
                  </Text>
                </Box>
              )}

              {!loading && !error && applications.length > 0 && (
                <Grid
                  templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  }}
                  gap={6}
                >
                  {applications.map((application) => (
                    <Card
                      key={application.applicationId}
                      variant="outline"
                      bg={
                        application.selected ? "green.50" : "white"
                      }
                      borderColor={
                        application.selected
                          ? "green.200"
                          : "gray.200"
                      }
                      height="500px"
                      display="flex"
                      flexDirection="column"
                    >
                      <CardBody
                        display="flex"
                        flexDirection="column"
                        p={4}
                      >
                        <Flex
                          justify="space-between"
                          align="start"
                          mb={3}
                        >
                          <Box flex={1} mr={2}>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              noOfLines={1}
                            >
                              {application.user?.firstName}{" "}
                              {application.user?.lastName}
                            </Text>
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              noOfLines={1}
                            >
                              {application.user?.email}
                            </Text>
                          </Box>
                          <Badge
                            colorScheme="blue"
                            fontSize="xs"
                            flexShrink={0}
                          >
                            ID: {application.applicationId}
                          </Badge>
                        </Flex>

                        <Flex mb={3} gap={1} flexWrap="wrap">
                          <Badge
                            colorScheme="green"
                            variant="subtle"
                            fontSize="xs"
                          >
                            {application.type}
                          </Badge>
                          <Badge
                            colorScheme="purple"
                            variant="subtle"
                            fontSize="xs"
                          >
                            {application.availability}
                          </Badge>
                          <Badge
                            colorScheme={
                              application.selected
                                ? "orange"
                                : "gray"
                            }
                            variant="subtle"
                            fontSize="xs"
                          >
                            {application.selected
                              ? "Selected"
                              : "Not Selected"}
                          </Badge>
                        </Flex>

                        <Box flex={1} overflow="hidden" mb={3}>
                          <Box mb={3}>
                            <Text
                              fontSize="xs"
                              fontWeight="semibold"
                              color="gray.700"
                              mb={1}
                            >
                              Academic Credentials
                            </Text>
                            <Tooltip
                              label={
                                application.academicCredentials
                              }
                              placement="top"
                              hasArrow
                            >
                              <Text
                                fontSize="xs"
                                color="gray.600"
                                noOfLines={2}
                              >
                                {
                                  application.academicCredentials
                                }
                              </Text>
                            </Tooltip>
                          </Box>

                          <Box mb={3}>
                            <Text
                              fontSize="xs"
                              fontWeight="semibold"
                              color="gray.700"
                              mb={1}
                            >
                              Previous Roles
                            </Text>
                            <Tooltip
                              label={application.previousRoles}
                              placement="top"
                              hasArrow
                            >
                              <Text
                                fontSize="xs"
                                color="gray.600"
                                noOfLines={2}
                              >
                                {application.previousRoles}
                              </Text>
                            </Tooltip>
                          </Box>

                          <Box mb={3}>
                            <Text
                              fontSize="xs"
                              fontWeight="semibold"
                              color="gray.700"
                              mb={1}
                            >
                              Skills
                            </Text>
                            <Tooltip
                              label={application.skills}
                              placement="top"
                              hasArrow
                            >
                              <Text
                                fontSize="xs"
                                color="gray.600"
                                noOfLines={2}
                              >
                                {application.skills}
                              </Text>
                            </Tooltip>
                          </Box>
                        </Box>

                        <Box mb={3} fontSize="xs" color="gray.500">
                          <Text>
                            Course: {application.courseCode}
                          </Text>
                        </Box>

                        <Flex gap={2} mt="auto">
                          <Button
                            size="sm"
                            colorScheme="green"
                            variant={
                              application.selected
                                ? "solid"
                                : "outline"
                            }
                            isLoading={selectingLoading}
                            isDisabled={application.selected}
                            onClick={() =>
                              handleSelectApplication(
                                application.applicationId!
                              )
                            }
                            flex={1}
                            fontSize="xs"
                          >
                            {application.selected
                              ? "Selected"
                              : "Select"}
                          </Button>

                          <Button
                            size="sm"
                            colorScheme="red"
                            variant={
                              application.selected
                                ? "solid"
                                : "outline"
                            }
                            isLoading={selectingLoading}
                            isDisabled={!application.selected}
                            onClick={() =>
                              handleDeselectApplication(
                                application.applicationId!
                              )
                            }
                            flex={1}
                            fontSize="xs"
                          >
                            {!application.selected
                              ? "Deselected"
                              : "Deselect"}
                          </Button>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                </Grid>
              )}
            </Box>
          </Flex>
          <Footer />
        </Flex>
      </LecturerAuth>
    </>
  );
};

export default Applications;
