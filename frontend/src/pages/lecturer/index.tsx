import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Flex, Text, Box, VStack, HStack, Card, CardBody, Heading } from "@chakra-ui/react";
import { useRouter } from "next/router";
import LecturerAuth from "@/components/LecturerAuth";
import { SearchIcon, ViewIcon } from "@chakra-ui/icons";
import CoursesLect from "@/components/CoursesLect";
import { useAuth } from "@/context/AuthContext";

const navLinks = [{ label: "Dashboard", href: "/lecturer" }, { label: "Selected Applications", href: "/lecturer/selected" }, { label: "Search Applications", href: "/lecturer/searchTutors" }];




const Lecturer = () => {
  const router = useRouter();
  const { currentUser } = useAuth();

  return (
    <>
      <LecturerAuth>
        <Header navLinks={navLinks} />
        <Box minHeight="100vh" bg="gray.50">
          <Flex
            direction="column"
            align="center"
            justify="center"
            px={{ base: 4, md: 8 }}
            py={8}
            bg="gray.50"
          >
            <VStack spacing={6} textAlign="center" mb={8}>
              <Heading fontWeight="bold" color="gray.800">
                Welcome To Your Lecturer Dashboard
              </Heading>
              <Text fontSize={"xx-large"} color="blue.600" fontWeight="semibold">
                {currentUser?.firstName} {currentUser?.lastName}
              </Text>
              <Text fontSize="md" color="gray.600" maxW="600px">
                Manage applications for your assigned courses and review applications.
              </Text>
            </VStack>

            {/* cards for better navigation (feedback on a1) */}
            <HStack spacing={6} mb={8} flexWrap="wrap" justify="center">
              <Card
                cursor="pointer"
                onClick={() => router.push("/lecturer/searchTutors")}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
                maxW="250px"
              >
                <CardBody textAlign="center" py={6}>
                  <SearchIcon boxSize={8} color="blue.500" mb={3} />
                  <Text fontWeight="semibold" fontSize="lg" mb={2}>
                    Search Applications
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Browse and filter through all tutor applications
                  </Text>
                </CardBody>
              </Card>

              <Card
                cursor="pointer"
                onClick={() => router.push("/lecturer/selected")}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
                maxW="250px"
              >
                <CardBody textAlign="center" py={6}>
                  <ViewIcon boxSize={8} color="green.500" mb={3} />
                  <Text fontWeight="semibold" fontSize="lg" mb={2}>
                    Selected Tutors
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    View and manage your selected candidates
                  </Text>
                </CardBody>
              </Card>
            </HStack>
          </Flex>
          <CoursesLect />
        </Box>
        <Footer />
      </LecturerAuth>
    </>
  );
};

export default Lecturer;
