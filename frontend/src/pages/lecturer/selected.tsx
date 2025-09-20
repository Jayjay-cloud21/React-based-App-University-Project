import React, { useEffect, useState } from "react";
import {
  Flex, Text, Box, Spinner, Alert, AlertIcon, Grid, Card, CardBody,
  Badge, Tooltip, Button, useToast, Select, FormControl, FormLabel, Divider,
  IconButton, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton,
  PopoverHeader, Stack, PopoverBody, Textarea
} from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon, ChatIcon, ArrowBackIcon } from "@chakra-ui/icons";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LecturerAuth from "@/components/LecturerAuth";
import { SelectedApplication } from "@/types/selectedApplication";
import { useLect } from "@/context/LectContext";
import NewCourse from "@/types/newCourse";

const navLinks = [{ label: "Dashboard", href: "/lecturer" }, { label: "Selected Applications", href: "/lecturer/selected" }, { label: "Search Applications", href: "/lecturer/searchTutors" }];


const SelectedTutors = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const {
    unSelectApplication, selectingLoading, selectingError,
    rankingLoading, commentsLoading, addingCommentLoading,
    coursesLoading, comments,
    promoteApplication, demoteApplication,
    addCommentToSelection, fetchCommentsForApplication,
    fetchCoursesForLecturer, fetchAllSelectedApplications
  } = useLect();

  const [selectedApplications, setSelectedApplications] = useState<SelectedApplication[]>([]);
  const [allSelectedApplications, setAllSelectedApplications] = useState<SelectedApplication[]>([]);
  const [courses, setCourses] = useState<NewCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>("");
  const [selectedAppForComment, setSelectedAppForComment] = useState<number | null>(null);
  const toast = useToast();

  useEffect(() => {
    const loadCourses = async () => {
      if (!currentUser?.id) return;

      try {
        const coursesData = await fetchCoursesForLecturer(currentUser.id);
        setCourses(coursesData);
      } catch (err) {
        console.error("Error loading courses:", err);
        setError("Failed to load courses.");
      }
    };

    if (currentUser?.id) {
      loadCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);


  useEffect(() => {
    if (courses.length > 0) {
      loadSelectedApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

  // filter applications when selected course changes
  useEffect(() => {
    if (selectedCourse === "") {
      setSelectedApplications([]);
    } else {
      const filtered = allSelectedApplications.filter(
        app => app.application.courseCode === selectedCourse
      );
      // Sort by rank when filtered
      filtered.sort((a, b) => a.rank - b.rank);
      setSelectedApplications(filtered);
    }
  }, [selectedCourse, allSelectedApplications]);

  const loadSelectedApplications = async () => {
    if (!currentUser?.id || courses.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // fetch applications that have been selected only
      const allSelected = await fetchAllSelectedApplications(courses);
      setAllSelectedApplications(allSelected);
      setSelectedApplications(allSelected);
    } catch (err) {
      console.error("Error in loadSelectedApplications:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeselectApplication = async (applicationId: number, courseCode: string) => {
    // same function and functionality as in [applicants].tsx
    if (!applicationId || !courseCode) return;

    const success = await unSelectApplication(courseCode, applicationId);

    if (success) {
      toast({
        title: "Application Deselected",
        description: "The application has been successfully deselected.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // refresh list
      loadSelectedApplications();
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

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourse(e.target.value);
  };

  const handlePromoteApplication = async (applicationId: number, courseCode: string) => {
    const success = await promoteApplication(courseCode, applicationId);

    if (success) {
      toast({
        title: "Rank Updated",
        description: "The application has been moved up in rank.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // refresh the applications list
      loadSelectedApplications();
    } else {
      toast({
        title: "Ranking Failed",
        description: "Failed to update rank.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDemoteApplication = async (applicationId: number, courseCode: string) => {
    const success = await demoteApplication(courseCode, applicationId);

    if (success) {
      toast({
        title: "Rank Updated",
        description: "The application has been moved down in rank.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // refresh the applications list
      loadSelectedApplications();
    } else {
      toast({
        title: "Ranking Failed",
        description: "Failed to update rank.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !selectedAppForComment || !currentUser?.id) return;

    const courseCode = allSelectedApplications.find(
      app => app.id === selectedAppForComment
    )?.application.courseCode || "";

    const success = await addCommentToSelection(
      courseCode,
      selectedAppForComment,
      comment,
      currentUser.id
    );

    if (success) {
      toast({
        title: "Feedback Added",
        description: "Your feedback has been saved successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setComment("");
    } else {
      toast({
        title: "Failed to Add Feedback",
        description: "Failed to save your feedback.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // render an application card
  const renderApplicationCard = (selectedApp: SelectedApplication, courseApps: SelectedApplication[] = []) => {
    // determine if this is the first or last in its course (for disabling rank buttons)
    const isFirstInCourse = courseApps.length > 0 && courseApps[0].id === selectedApp.id;
    const isLastInCourse = courseApps.length > 0 && courseApps[courseApps.length - 1].id === selectedApp.id;

    const promoteLoadingKey = `promote-${selectedApp.application.applicationId}`;
    const demoteLoadingKey = `demote-${selectedApp.application.applicationId}`;

    return (
      <Card
        key={selectedApp.id}
        variant="outline"
        bg="green.50"
        borderColor="green.200"
        height="350px"
        display="flex"
        flexDirection="column"
        mb={3}
      >
        <CardBody display="flex" flexDirection="column" p={3}>
          <Flex justify="space-between" align="start" mb={2}>
            <Box flex={1} mr={2}>
              <Text fontSize="md" fontWeight="bold" noOfLines={1}>
                {selectedApp.application.user?.firstName} {selectedApp.application.user?.lastName}
              </Text>
              <Text fontSize="xs" color="gray.600" noOfLines={1}>
                {selectedApp.application.user?.email}
              </Text>
            </Box>
            <Badge colorScheme="blue" fontSize="xs" flexShrink={0}>
              ID: {selectedApp.application.applicationId}
            </Badge>
          </Flex>

          <Flex mb={2} gap={1} flexWrap="wrap">
            <Badge colorScheme="green" variant="subtle" fontSize="xs">
              {selectedApp.application.type}
            </Badge>
            <Badge colorScheme="purple" variant="subtle" fontSize="xs">
              {selectedApp.application.availability}
            </Badge>
            <Badge colorScheme="orange" variant="subtle" fontSize="xs">
              Selected
            </Badge>
            <Badge colorScheme="teal" variant="subtle" fontSize="xs">
              Rank: {selectedApp.rank}
            </Badge>
          </Flex>

          <Box flex={1} overflow="hidden" mb={2}>
            <Box mb={2}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={1}>
                Academic Credentials
              </Text>
              <Tooltip label={selectedApp.application.academicCredentials} placement="top" hasArrow>
                <Text fontSize="xs" color="gray.600" noOfLines={1}>
                  {selectedApp.application.academicCredentials}
                </Text>
              </Tooltip>
            </Box>

            <Box mb={2}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={1}>
                Previous Roles
              </Text>
              <Tooltip label={selectedApp.application.previousRoles} placement="top" hasArrow>
                <Text fontSize="xs" color="gray.600" noOfLines={1}>
                  {selectedApp.application.previousRoles}
                </Text>
              </Tooltip>
            </Box>

            <Box mb={2}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.700" mb={1}>
                Skills
              </Text>
              <Tooltip label={selectedApp.application.skills} placement="top" hasArrow>
                <Text fontSize="xs" color="gray.600" noOfLines={1}>
                  {selectedApp.application.skills}
                </Text>
              </Tooltip>
            </Box>
          </Box>

          <Box mb={2} fontSize="xs" color="gray.500">
            <Text>Course: {selectedApp.application.courseCode}</Text>
          </Box>

          {/* ranking controls */}
          <Flex justify="center" mb={2} gap={1}>
            <Tooltip label={isFirstInCourse ? "Already highest rank" : "Move up in ranking"}>
              <IconButton
                aria-label="Move up in rank"
                icon={<ChevronUpIcon />}
                size="sm"
                colorScheme="blue"
                isLoading={rankingLoading[promoteLoadingKey]}
                isDisabled={isFirstInCourse}
                onClick={() => handlePromoteApplication(selectedApp.application.applicationId!, selectedApp.application.courseCode)}
              />
            </Tooltip>
            <Tooltip label={isLastInCourse ? "Already lowest rank" : "Move down in ranking"}>
              <IconButton
                aria-label="Move down in rank"
                icon={<ChevronDownIcon />}
                size="sm"
                colorScheme="blue"
                isLoading={rankingLoading[demoteLoadingKey]}
                isDisabled={isLastInCourse}
                onClick={() => handleDemoteApplication(selectedApp.application.applicationId!, selectedApp.application.courseCode)}
              />
            </Tooltip>
          </Flex>

          <Flex gap={1} mt="auto">
            <Popover
              placement="top"
              closeOnBlur={true}
              onOpen={() => {
                setSelectedAppForComment(selectedApp.id);
                fetchCommentsForApplication(selectedApp.id);
              }}
              onClose={() => {
                setSelectedAppForComment(null);
                setComment("");
              }}
            >
              <PopoverTrigger>
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  leftIcon={<ChatIcon />}
                  flex={1}
                  fontSize="xs"
                >
                  Feedback
                </Button>
              </PopoverTrigger>
              <PopoverContent width="300px">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader fontWeight="semibold">
                  Lecturer Feedback
                </PopoverHeader>
                <PopoverBody>
                  <Stack spacing={3}>
                    {/* display existing comments section */}
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Previous Feedback:
                      </Text>

                      {commentsLoading ? (
                        <Flex justify="center" py={2}>
                          <Spinner size="sm" />
                        </Flex>
                      ) : comments[selectedApp.id]?.length > 0 ? (
                        <Box
                          maxHeight="150px"
                          overflowY="auto"
                          borderWidth="1px"
                          borderColor="gray.200"
                          borderRadius="md"
                          p={2}
                        >
                          {comments[selectedApp.id]?.map((comment, i) => (
                            <Box
                              key={i}
                              p={2}
                              bg="gray.50"
                              borderRadius="md"
                              mb={2}
                              fontSize="xs"
                              borderLeft="3px solid"
                              borderLeftColor="blue.300"
                            >
                              <Text fontWeight="bold">
                                {currentUser && currentUser.id === comment.authorUserId
                                  ? `${currentUser.firstName} ${currentUser.lastName}`
                                  : `Lecturer #${comment.authorUserId}`} - {new Date(comment.createdAt).toLocaleDateString()}
                              </Text>
                              <Text mt={1}>{comment.content}</Text>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Text fontSize="xs" color="gray.500">
                          No previous feedback available.
                        </Text>
                      )}
                    </Box>
                    <Divider />
                    {/* add new comment section */}
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Add New Feedback:
                      </Text>
                      <Textarea
                        placeholder="Enter your feedback for this applicant..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        size="sm"
                        resize="vertical"
                        rows={3}
                      />
                    </Box>

                    <Button
                      colorScheme="green"
                      size="sm"
                      onClick={handleAddComment}
                      isLoading={addingCommentLoading}
                      isDisabled={!comment.trim()}
                    >
                      Submit
                    </Button>
                  </Stack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
            <Button
              size="sm"
              colorScheme="red"
              variant="solid"
              isLoading={selectingLoading}
              onClick={() => handleDeselectApplication(selectedApp.application.applicationId!, selectedApp.application.courseCode)}
              flex={1}
              fontSize="xs"
            >
              Deselect
            </Button>
          </Flex>
        </CardBody>
      </Card>
    );
  };

  return (
    <LecturerAuth>
      <Header navLinks={navLinks} />
      <Flex
        direction="column"
        align="center"
        justify="space-between"
        minHeight="100vh"
        bg="gray.100"
      >
        <Flex direction="column" align="center" justify="center" px={4} py={6} width="100%">
          <Box
            width="100%"
            maxW="1200px"
            px="12%"
            mb={4}
          >
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="outline"
              colorScheme="blue"
              onClick={() => router.push("/lecturer")}
            >
              Back
            </Button>
          </Box>

          <Text fontSize="4xl" fontWeight="bold" mb={4} textAlign="center">
            Selected Applications
          </Text>
          <Text mb={6}>
            Select a course.
          </Text>

          <Box width="100%" maxWidth="1200px">
            {/* course filter dropdown */}
            <FormControl mb={6} maxWidth="400px" mx="auto">
              <FormLabel fontWeight="medium">Select Course:</FormLabel>
              <Select
                value={selectedCourse}
                onChange={handleCourseChange}
                bg="white"
                borderColor="gray.300"
                _hover={{ borderColor: "green.400" }}
                placeholder="Choose a course to view applications"
              >
                {courses.map(course => (
                  <option key={course.code} value={course.code}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            {(loading || coursesLoading) && (
              <Flex justify="center" align="center" height="200px">
                <Spinner size="xl" thickness="4px" speed="0.65s" color="green.500" />
              </Flex>
            )}

            {error && (
              <Alert status="error" borderRadius="md" mb={4}>
                <AlertIcon />
                {error}
              </Alert>
            )}

            {!loading && !error && selectedCourse === "" && (
              <Box textAlign="center" p={8}>
                <Text fontSize="lg" color="gray.500">
                  Please select a course to view selected applications.
                </Text>
                <Text fontSize="sm" color="gray.400" mt={2}>
                  Choose a course from the dropdown above to see your selected tutors.
                </Text>
              </Box>
            )}

            {!loading && !error && selectedCourse !== "" && selectedApplications.length === 0 && (
              <Box textAlign="center" p={8}>
                <Text fontSize="lg" color="gray.500">
                  No selected applications found for {selectedCourse}.
                </Text>
                <Text fontSize="sm" color="gray.400" mt={2}>
                  You haven&apos;t selected any applications for this course yet.
                </Text>
              </Box>
            )}

            {!loading && !error && selectedCourse !== "" && selectedApplications.length > 0 && (
              <Box width="100%" maxWidth="500px" mx="auto">
                <Grid
                  templateColumns="1fr"
                  gap={3}
                >
                  {selectedApplications
                    .sort((a, b) => a.rank - b.rank)
                    .map(selectedApp => renderApplicationCard(selectedApp, selectedApplications))}
                </Grid>
              </Box>
            )}
          </Box>
        </Flex>
        <Footer />
      </Flex>
    </LecturerAuth>
  );
};

export default SelectedTutors;