import React, { FormEvent, useEffect } from "react";
import {
  Flex,
  Button,
  Input,
  Select,
  Box,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useLect } from "@/context/LectContext";
import { lecturerApi } from "@/services/lecturerApi";
import { Application } from "@/types/application";
import NewCourse from "@/types/newCourse";
import { ArrowUpDownIcon, SearchIcon } from "@chakra-ui/icons";

const SearchBar = () => {
  const { currentUser } = useAuth();
  const { selectApplication, unSelectApplication, fetchCoursesForLecturer } = useLect();

  // applications and courses states
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [courses, setCourses] = useState<NewCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //  search parameters state
  const [searchParameters, setSearchParameters] = useState({
    courseName: "",
    availability: "",
    candidateName: "",
    skillSet: "",
    sessionType: "",
  });

  const [currentSort, setCurrentSort] = useState("");
  const [showUnselectedTutors, setShowUnselectedTutors] = useState(false);

  // fetch applications and courses
  const fetchApplicationsAndCourses = async () => {
    if (!currentUser?.id) return;

    setLoading(true);
    setError(null);

    try {      // get all applications
      const applicationsResult = await lecturerApi.getAllApplications();
      if (applicationsResult.success && applicationsResult.data) {
        setApplications(applicationsResult.data);
      } else {
        setError(applicationsResult.message || "Failed to fetch applications");
      }

      // fetch courses for lecturer
      const coursesResult = await fetchCoursesForLecturer(currentUser.id);
      setCourses(coursesResult);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // load applications and courses
  useEffect(() => {
    fetchApplicationsAndCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // filter applications function
  const filterApplications = () => {
    let filtered = [...applications];

    //filter to only show applications for courses the lecturer teaches
    const lecturerCourseCodes = courses.map(course => course.code);
    filtered = filtered.filter(app => lecturerCourseCodes.includes(app.courseCode));

    // then apply search parameter filters
    if (searchParameters.courseName) {
      filtered = filtered.filter(app => {
        const courseName = app.course?.name || "";
        const courseCode = app.courseCode || "";
        const searchTerm = searchParameters.courseName.toLowerCase();
        return courseName.toLowerCase().includes(searchTerm) ||
          courseCode.toLowerCase().includes(searchTerm);
      });
    }

    // filtering by availability functionality
    if (searchParameters.availability) {
      filtered = filtered.filter(app => app.availability === searchParameters.availability);
    }
    // by candidate name
    if (searchParameters.candidateName) {
      const nameSearch = searchParameters.candidateName.toLowerCase();
      filtered = filtered.filter(app => {
        const firstName = app.user?.firstName || "";
        const lastName = app.user?.lastName || "";
        const fullName = `${firstName} ${lastName}`;
        return firstName.toLowerCase().includes(nameSearch) ||
          lastName.toLowerCase().includes(nameSearch) ||
          fullName.toLowerCase().includes(nameSearch);
      });
    }

    // filter by skill set
    if (searchParameters.skillSet) {
      filtered = filtered.filter(app =>
        app.skills.toLowerCase().includes(searchParameters.skillSet.toLowerCase())
      );
    }

    // filter by session type (tutorial/lab)
    if (searchParameters.sessionType) {
      filtered = filtered.filter(app => app.type === searchParameters.sessionType);
    }

    // filter by selection status if requested
    if (showUnselectedTutors) {
      filtered = filtered.filter(app => !app.selected);
    }

    setFilteredApplications(filtered);
  };

  // filter applications when search parameters change
  useEffect(() => {
    filterApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applications, searchParameters, showUnselectedTutors]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSearchParameters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectApplication = async (application: Application) => {
    if (!application.applicationId || !application.courseCode) return;

    try {
      const success = await selectApplication(application.courseCode, application.applicationId);
      if (success) {
        // refresh the applications list
        fetchApplicationsAndCourses();
      }
    } catch (err) {
      console.error("Error selecting application:", err);
    }
  };

  const handleUnselectApplication = async (application: Application) => {
    if (!application.applicationId || !application.courseCode) return;

    try {
      const success = await unSelectApplication(application.courseCode, application.applicationId);
      if (success) {
        // refresh
        fetchApplicationsAndCourses();
      }
    } catch (err) {
      console.error("Error unselecting application:", err);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    filterApplications();
  };

  const handleSort = (sortBy: string) => {
    const sorted = [...filteredApplications];

    switch (sortBy) {
      case "courseName":
        sorted.sort((a, b) => a.courseCode.localeCompare(b.courseCode));
        setCurrentSort(currentSort === "courseName" ? "courseName-desc" : "courseName");
        if (currentSort === "courseName") {
          sorted.reverse();
        }
        break;
      case "availability":
        sorted.sort((a, b) => a.availability.localeCompare(b.availability));
        setCurrentSort(currentSort === "availability" ? "availability-desc" : "availability");
        if (currentSort === "availability") {
          sorted.reverse();
        }
        break;
      default:
        break;
    }

    setFilteredApplications(sorted);
  };

  // Helper function to get course name from course code
  const getCourseName = (courseCode: string) => {
    const course = courses.find(c => c.code === courseCode);
    return course ? course.name : courseCode;
  };
  return (
    <Flex
      direction="column"
      gap={4}
      alignItems="center"
      justifyContent="center"
      width="100%"
    >
      {error && (
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <form onSubmit={handleSearch} style={{ width: "100%" }}>
        <Flex gap={2} wrap="wrap" justifyContent="center" mb={4}>
          <Select
            name="courseName"
            placeholder="Course Name"
            data-testid="course-select"
            borderColor="gray.500"
            value={searchParameters.courseName}
            onChange={handleInputChange}
          >
            {courses.map((course) => (
              <option key={course.code} value={course.name}>
                {course.name} - {course.code}
              </option>
            ))}
          </Select>

          <Select
            name="availability"
            placeholder="Availability"
            data-testid="availability-select"
            borderColor="gray.500"
            value={searchParameters.availability}
            onChange={handleInputChange}
          >
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
          </Select>

          <Select
            name="sessionType"
            placeholder="Session Type"
            data-testid="session-type-select"
            borderColor="gray.500"
            value={searchParameters.sessionType}
            onChange={handleInputChange}
          >
            <option value="Tutor">Tutorial</option>
            <option value="Lab Assistant">Lab</option>
          </Select>

          <Input
            name="candidateName"
            placeholder="Candidate Name"
            data-testid="candidate-name-input"
            _placeholder={{ color: "gray.500" }}
            borderColor="gray.500"
            value={searchParameters.candidateName}
            onChange={handleInputChange}
          />

          <Input
            name="skillSet"
            placeholder="Skill set"
            data-testid="skillSet-select"
            _placeholder={{ color: "gray.500" }}
            borderColor="gray.500"
            value={searchParameters.skillSet}
            onChange={handleInputChange}
          />

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            width="100%"
            isLoading={loading}
          >
            <SearchIcon mr={2} />
            Search
          </Button>
        </Flex>
      </form>

      <Flex gap={2} wrap="wrap" justifyContent="center" mb={4}>
        <Button
          colorScheme={currentSort.includes("courseName") ? "green" : "gray"}
          onClick={() => handleSort("courseName")}
        >
          <ArrowUpDownIcon mr={2} />
          {currentSort.includes("courseName") ? "Sorted by Course Name" : "Sort by Course Name"}
        </Button>

        <Button
          colorScheme={currentSort.includes("availability") ? "green" : "gray"}
          onClick={() => handleSort("availability")}
        >
          <ArrowUpDownIcon mr={2} />
          {currentSort.includes("availability") ? "Sorted by Availability" : "Sort by Availability"}
        </Button>

        <Button
          colorScheme={showUnselectedTutors ? "green" : "gray"}
          onClick={() => setShowUnselectedTutors((prev) => !prev)}
        >
          {showUnselectedTutors ? "Show All Tutors" : "Show Unselected Tutors Only"}
        </Button>
      </Flex>

      {loading && (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" thickness="4px" speed="0.65s" color="green.500" />
        </Flex>
      )}

      {!loading && filteredApplications.length > 0 ? (
        <SimpleGrid
          columns={3}
          spacing={4}
          width="100%"
        >
          {filteredApplications.map((application, id) => {
            const isSelected = application.selected;
            return (
              <Card
                key={application.applicationId || id}
                variant="outline"
                borderColor={isSelected ? "green.500" : "gray.200"}
                borderWidth={isSelected ? "2px" : "1px"}
                bg={isSelected ? "green.50" : "white"}
              >
                <CardBody display="flex" flexDirection="column" height="100%">
                  <Box>
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text fontWeight="bold">
                        {application.user?.firstName} {application.user?.lastName}
                      </Text>
                      {isSelected ? (
                        <Badge colorScheme="green" ml={2}>
                          Selected
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          colorScheme="green"
                          onClick={() => handleSelectApplication(application)}
                        >
                          Select
                        </Button>
                      )}
                    </Flex>
                    <Text fontSize="sm">{application.user?.email}</Text>
                    <Text mt={2} fontSize="sm">
                      <Text as="span" fontWeight="bold" color="blue.500">
                        Credentials:
                      </Text>{" "}
                      {application.academicCredentials}
                    </Text>
                    <Text mt={2} fontSize="sm">
                      <Text as="span" fontWeight="bold" color="blue.500">
                        Availability:
                      </Text>{" "}
                      {application.availability}
                    </Text>
                    <Text mt={1} fontSize="sm">
                      <Text as="span" fontWeight="bold" color="blue.500">
                        Course:
                      </Text>{" "}
                      {application.courseCode} ({getCourseName(application.courseCode)})
                    </Text>
                    <Text mt={1} fontSize="sm">
                      <Text as="span" fontWeight="bold" color="blue.500">
                        Session Type:
                      </Text>{" "}
                      {application.type}
                    </Text>
                    <Text mt={1} fontSize="sm">
                      <Text as="span" fontWeight="bold" color="blue.500">
                        Skills:
                      </Text>{" "}
                      {application.skills}
                    </Text>
                  </Box>
                  {isSelected && (
                    <Flex justify="right" mt="auto" pt={3}>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => handleUnselectApplication(application)}
                      >
                        Unselect
                      </Button>
                    </Flex>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>
      ) : !loading ? (
        <Box textAlign="center" p={8}>
          <Text fontSize="lg">No matching tutors found.</Text>
          <Text mt={2}>Try adjusting your search filters above.</Text>
        </Box>
      ) : null}


    </Flex>
  );
};

export default SearchBar;
