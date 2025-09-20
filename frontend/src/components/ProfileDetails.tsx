import {
  Box,
  Text,
  Flex,
  VStack,
  HStack,
  Badge,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";

import NewUser from "@/types/newUser";
import { Application } from "@/types/application";
import { useCand } from "@/context/CandidateContext";

// props for the profile details
interface ProfileDetailsProps {
  user: NewUser | null;
  applications: Application[] | null;
  isLoading: boolean;
}

// for displaying information rows
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <HStack justifyContent="space-between" mb={2}>
    <Text fontWeight="medium" color="gray.600">{label}:</Text>
    <Text>{value}</Text>
  </HStack>
);

// for application details in grid layout
const Grid = ({ columns, children }: { columns: number; children: React.ReactNode }) => (
  <Box
    display="grid"
    gridTemplateColumns={`repeat(${columns}, 1fr)`}
    gap={4}
    mb={3}
  >
    {children}
  </Box>
);

// custom InfoItem component for displaying label-value pairs in the grid
const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <Box>
    <Text fontWeight="medium" color="gray.600">{label}:</Text>
    <Text>{value}</Text>
  </Box>
);

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ user, applications, isLoading }) => {

  const { courses } = useCand();

  //find course name using course code
  const findCoursename = (courseCode: string) => {
    const course = courses.find(course => course.code === courseCode);
    return course ? course.name : "";
  }

  if (isLoading) {
    return (
      <Box
        w={{ base: "95%", md: "800px" }}
        p={6}
        bg="white"
        borderRadius="lg"
        boxShadow="md"
        textAlign="center"
      >
        <Text>Loading profile information...</Text>
      </Box>
    );
  }

  // Calculate membership duration
  const joinDate = new Date(user?.createdAt || Date.now());
  const membershipDuration = formatDistance(
    joinDate,
    new Date(),
  );

  // Collect all unique skills and credentials from applications
  const allSkills = new Set<string>();
  const allCredentials = new Set<string>();
  const allRoles = new Set<string>();
  const allCourseCodes = new Set<string>();


  applications?.forEach(app => {
    if (app.skills) allSkills.add(app.skills);
    if (app.academicCredentials) allCredentials.add(app.academicCredentials);
    if (app.type) allRoles.add(app.type);
    if (app.courseCode) allCourseCodes.add(app.courseCode);
  });

  return (
    <Box
      w={{ base: "95%", md: "800px" }}
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      overflow="hidden"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        align="center"
        bg="green.100"
        p={6}
      >
        <VStack align={{ base: "center", md: "start" }} spacing={1}>
          <Text fontSize="2xl" fontWeight="bold">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text color="gray.600">
            {user?.email}
          </Text>
          <HStack mt={1}>
            <Badge colorScheme="green">{user?.role}</Badge>
            <Badge colorScheme="blue">
              Member for {membershipDuration}
            </Badge>
          </HStack>
        </VStack>
      </Flex>

      {/* Profile content */}
      <Tabs colorScheme="green" p={4}>
        <TabList>
          <Tab>Profile</Tab>
          <Tab>Applications ({applications?.length || 0})</Tab>
        </TabList>

        <TabPanels>
          {/* Profile Tab */}
          <TabPanel>
            <VStack align="start" spacing={6} w="100%">
              <Box w="100%">
                <Text fontSize="lg" fontWeight="bold" mb={3}>
                  Personal Information
                </Text>
                <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
                  <InfoRow label="Name" value={`${user?.firstName} ${user?.lastName}`} />
                  <InfoRow label="Email" value={user?.email ?? ""} />
                  <InfoRow label="Member Since" value={joinDate.toLocaleDateString()} />
                </Box>
              </Box>

              <Box w="100%">
                <Text fontSize="lg" fontWeight="bold" mb={3}>
                  Professional Details
                </Text>
                <Box p={4} borderWidth="1px" borderRadius="md" bg="white">
                  <InfoRow
                    label="Academic Credentials"
                    value={allCredentials.size > 0 ? Array.from(allCredentials).join(", ") : "No credentials provided yet"}
                  />
                  <InfoRow
                    label="Skills"
                    value={allSkills.size > 0 ? Array.from(allSkills).join(", ") : "No skills provided yet"}
                  />
                  <InfoRow
                    label="Roles Applied For"
                    value={allRoles.size > 0 ? Array.from(allRoles).join(", ") : "No roles applied for yet"}
                  />
                  <InfoRow
                    label="Courses Applied"
                    value={allCourseCodes.size > 0 ? Array.from(allCourseCodes).join(", ") : "No courses applied for yet"}
                  />
                </Box>
              </Box>
            </VStack>
          </TabPanel>

          {/* Applications Tab */}
          <TabPanel>
            {applications && applications.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {applications.map((app, idx) => (
                  <Box
                    key={idx}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="green.50"
                  >
                    <Text fontWeight="bold" fontSize="lg">
                      {app.courseCode} - {findCoursename(app.courseCode)}
                    </Text>
                    <Divider my={2} />

                    <Grid columns={2}>
                      <InfoItem label="Applied As" value={app.type} />
                      <InfoItem label="Availability" value={app.availability} />
                      <InfoItem label="Applied On" value={new Date(app.createdAt ?? "").toLocaleDateString()} />
                    </Grid>

                    <Divider my={2} />

                    <Text fontWeight="medium" mb={1}>Academic Credentials:</Text>
                    <Text mb={3}>{app.academicCredentials}</Text>

                    <Text fontWeight="medium" mb={1}>Previous Roles:</Text>
                    <Text mb={3}>{app.previousRoles}</Text>

                    <Text fontWeight="medium" mb={1}>Skills:</Text>
                    <Text>{app.skills}</Text>
                  </Box>
                ))}
              </VStack>
            ) : (
              <Box p={4} borderWidth="1px" borderRadius="md" textAlign="center">
                <Text>You haven&apos;t submitted any applications yet.</Text>
              </Box>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

function formatDistance(joinDate: Date, endDate: Date) {
  // calculate difference in years, months, days
  const diffMs = endDate.getTime() - joinDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffYears = Math.floor(diffDays / 365);
  const diffMonths = Math.floor((diffDays % 365) / 30);

  if (diffYears > 0) {
    return `${diffYears} year${diffYears > 1 ? "s" : ""}${diffMonths > 0 ? `, ${diffMonths} month${diffMonths > 1 ? "s" : ""}` : ""}`;
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""}`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  }
}

export default ProfileDetails;

