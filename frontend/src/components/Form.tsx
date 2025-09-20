import React, { useEffect } from "react";
import { useRouter } from "next/router";
import {
  Input,
  Flex,
  Select,
  FormLabel,
  FormControl,
  HStack,
  VStack,
  Button,
  Textarea,
  Text,
  Box,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import { useCand } from "@/context/CandidateContext";
import { useState } from "react";
import { Application } from "@/types/application";

const Form = () => {
  const { currentUser } = useAuth();
  const { cancel, saveApplication, tutorApps, labApps } = useCand();
  const router = useRouter();
  const { courseCode } = router.query;
  const [error, setError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [hasTutorAppForThisCourse, setHasTutorAppForThisCourse] = useState(false);
  const [hasLabAppForThisCourse, setHasLabAppForThisCourse] = useState(false);

  // check if the user has already applied for this specific course
  useEffect(() => {
    if (courseCode && tutorApps && tutorApps.length > 0) {
      const hasTutorApp = tutorApps.some(app => app.courseCode === courseCode);
      setHasTutorAppForThisCourse(hasTutorApp);
    }
    
    if (courseCode && labApps && labApps.length > 0) {
      const hasLabApp = labApps.some(app => app.courseCode === courseCode);
      setHasLabAppForThisCourse(hasLabApp);
    }
  }, [courseCode, tutorApps, labApps]);

  // set a default type if one role is already applied for
  useEffect(() => {
    if (hasTutorAppForThisCourse && !hasLabAppForThisCourse) {
      // if already applied as tutor, set type to lab assistant
      setApplication(prev => ({...prev, type: "Lab Assistant"}));
    } else if (!hasTutorAppForThisCourse && hasLabAppForThisCourse) {
      // if already applied as lab assistant, set type to tutor
      setApplication(prev => ({...prev, type: "Tutor"}));
    }
  }, [hasTutorAppForThisCourse, hasLabAppForThisCourse]);

  //Initializing form data with default values
  const [application, setApplication] = useState<Application>({
    id: currentUser?.id || 0,
    email: currentUser?.email || "",
    password: currentUser?.password || "",
    type: "Tutor",
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    academicCredentials: "",
    availability: "Full Time",
    previousRoles: "",
    skills: "",
    courseCode: courseCode as string,
    role: "Candidate",
    selected: false,
  });

  // function to handle checkbox changes
  const handleTypeChange = (value: string) => {
    setApplication((prev) => ({
      ...prev,
      type: value as "Tutor" | "Lab Assistant",
    }));
  };

  // Function to handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;
    setApplication((prev) => ({
      ...prev,
      [id]: value,
    }));
  };


  // function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormSubmitting(true);

    // check all required fields
    if (
      !application.firstName ||
      !application.lastName ||
      !application.academicCredentials ||
      !application.previousRoles ||
      !application.skills
    ) {
      setError("Please fill in required fields");
      setFormSubmitting(false);
      return;
    }

    // validate role selection
    if (!application.type) {
      setError("Please select a role");
      setFormSubmitting(false);
      return;
    }

    // save the application
    try {
      const result = await saveApplication(application);
      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("Failed to submit application");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <Flex
      flexDirection="column"
      align="center"
      justify="center"
      mx="auto"
      border="1px solid"
      borderColor="gray.200"
      w={["100%", "90%", "80%", "700px"]}
      borderRadius="lg"
      boxShadow="lg"
      p={8}
      mt={3}
      bg="white"
    >
      <Text as="h1" fontSize="3xl" mb={4} data-testid="title">
        Application for {courseCode}
      </Text>

      <VStack spacing={5} align="flex-start" w="100%">
        <HStack w="100%" spacing={4}>
          <FormControl isRequired isReadOnly >
            <FormLabel htmlFor="firstName" mb={2}>
              First Name
            </FormLabel>
            <Input
              id="firstName"
              data-testid="firstName"
              placeholder={"First name"}
              _placeholder={{ color: "gray.400" }}
              borderColor={"gray.200"}
              bg="gray.50"
              value={application.firstName}
              onChange={handleChange}
              autoComplete="given-name"
            />
          </FormControl>

          <FormControl isRequired isReadOnly>
            <FormLabel htmlFor="lastName" mb={2}>
              Last Name
            </FormLabel>
            <Input
              id="lastName"
              data-testid="lastName"
              placeholder={"Last name"}
              _placeholder={{ color: "gray.400" }}
              borderColor={"gray.200"}
              bg="gray.50"
              isRequired
              value={application.lastName}
              onChange={handleChange}
              autoComplete="family-name"
            />
          </FormControl>
        </HStack>

        <HStack w="100%" spacing={4}>
          <FormControl isRequired>
            <FormLabel htmlFor="availability" mb={2}>
              Availability
            </FormLabel>
            <Select
              id="availability"
              data-testid="availability"
              value={application.availability}
              onChange={handleChange}
            >
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel htmlFor="academicCredentials" mb={2}>
              Academic Credentials
            </FormLabel>
            <Input
              id="academicCredentials"
              data-testid="academicCredentials"
              placeholder={error ? error : "Academic Credentials"}
              _placeholder={{ color: error ? "red.500" : "gray.400" }}
              borderColor={error ? "red.500" : "gray.200"}
              isRequired
              value={application.academicCredentials}
              onChange={handleChange}
            />
          </FormControl>
        </HStack>

        <FormControl isRequired>
          <FormLabel htmlFor="previousRoles" mb={2}>
            Previous Roles
          </FormLabel>
          <Textarea
            id="previousRoles"
            data-testid="previousRoles"
            placeholder={error ? error : "Describe your previous roles..."}
            _placeholder={{ color: error ? "red.500" : "gray.400" }}
            borderColor={error ? "red.500" : "gray.200"}
            value={application.previousRoles}
            onChange={handleChange}
            rows={4}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel htmlFor="skills" mb={2}>
            Skills
          </FormLabel>
          <Textarea
            id="skills"
            data-testid="skills"
            placeholder={error ? error : "List your relevant skills..."}
            _placeholder={{ color: error ? "red.500" : "gray.400" }}
            borderColor={error ? "red.500" : "gray.200"}
            value={application.skills}
            onChange={handleChange}
            rows={4}
          />
        </FormControl>

        <FormControl as="fieldset" isRequired mb={4}>
          <FormLabel as="legend" mb={2}>Role Application</FormLabel>
          <Box
            borderWidth="1px"
            borderRadius="md"
            p={4}
            borderColor={!application.type ? "red.500" : "gray.200"}
          >
            <RadioGroup
              onChange={handleTypeChange}
              value={application.type}
              colorScheme="green"
              aria-labelledby="type-label"
            >
              <HStack spacing={6}>
                <Radio value="Tutor"
                  isDisabled={hasTutorAppForThisCourse} 
                  _disabled={{
                  opacity: tutorApps.length > 0 ? 0.4 : 1,
                  cursor: "not-allowed"
                  }}
                >Tutor {hasTutorAppForThisCourse && "(Already Applied)"}
                </Radio>
                <Radio value="Lab Assistant"
                isDisabled={hasLabAppForThisCourse}
                _disabled={{
                  opacity: labApps.length > 0 ? 0.4 : 1,
                  cursor: "not-allowed"
                  }}
                >
                Lab Assistant {hasLabAppForThisCourse && "(Already Applied)"}
                </Radio>
              </HStack>
            </RadioGroup>
          </Box>
          {!application.type && error && (
            <Text color="red.500" fontSize="sm" mt={1}>
              Please select at least one role
            </Text>
          )}
        </FormControl>

        <FormControl isReadOnly mb={4}>
          <FormLabel htmlFor="email" mb={2}>
            Email Address
          </FormLabel>
          <Input
            data-testid="email"
            id="email"
            value={currentUser?.email || ""}
            bg="gray.50"
            autoComplete="email"
            readOnly
          />
        </FormControl>

        <FormControl isReadOnly mb={4}>
          <FormLabel htmlFor="course" mb={2}>
            Course
          </FormLabel>
          <Input
            data-testid="course"
            id="course"
            value={courseCode}
            bg="gray.50"
            autoComplete="course"
            readOnly
          />
        </FormControl>

        {error && !error.includes("role") && (
          <Box w="100%" p={3} bg="red.50" borderRadius="md" mb={4}>
            <Text color="red.500">{error}</Text>
          </Box>
        )}

        <HStack w="100%" spacing={4} justify="flex-end">
          <Button
            id="cancel"
            variant="outline"
            colorScheme="gray"
            onClick={cancel}
            isDisabled={formSubmitting}
          >
            Cancel
          </Button>

          <Button
            id="save"
            colorScheme="green"
            type="submit"
            onClick={handleSubmit}
            isLoading={formSubmitting}
            loadingText="Submitting"
          >
            Submit Application
          </Button>
        </HStack>
      </VStack>
    </Flex>
  );
};

export default Form;
