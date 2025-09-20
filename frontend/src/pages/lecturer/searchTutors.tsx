import React from "react";
import { Flex, Box, Button, Heading, VStack } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LecturerAuth from "@/components/LecturerAuth";
import SearchBar from "@/components/SearchBar";

const navLinks = [{ label: "Dashboard", href: "/lecturer" }, { label: "Selected Applications", href: "/lecturer/selected" }, { label: "Search Applications", href: "/lecturer/searchTutors" }];

// This is the main component for the lecturer search tutors page
const SearchTutors = () => {
  const router = useRouter();

  return (
    <>
      <LecturerAuth>
        <Header navLinks={navLinks} />
        <Flex
          direction="column"
          align="center"
          justify="flex-start"
          minH="100vh"
          w="100%"
          bg="gray.50"
          pb={20}
        >
          <Box
            mt={8}
            width="100%"
            maxW="800px"
            px={4}
          >
            {/* back button, feedback on a1 */}
            <Button
              leftIcon={<ArrowBackIcon />}
              variant="outline"
              colorScheme="blue"
              mb={4}
              onClick={() => router.push("/lecturer")}
            >
              Back
            </Button>
          </Box>

          <Box
            width="100%"
            maxW="800px"
            px={4}
            py={6}
            bg="white"
            borderRadius="lg"
            boxShadow="md"
          >
            <VStack spacing={4} align="stretch">
              <Heading size="lg" color="gray.800" textAlign="center">
                Search And Filter Applications
              </Heading>
              <SearchBar />
            </VStack>
          </Box>
        </Flex>
        <Footer />
      </LecturerAuth>
    </>
  );
};

export default SearchTutors;
