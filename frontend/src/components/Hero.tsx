import React from "react";
import { Box, Button, Text, Container } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

const Hero = () => {

  const router = useRouter();
  const { currentUser } = useAuth();

  const redirectToDashboard = () => {
    // redirect depending on the user role
    if (currentUser?.role === "Lecturer") {
      router.push("/lecturer");
    } else if (currentUser?.role === "Candidate") {
      router.push("/candidate");
    } else {
      router.push("/signin");
    }
  };

  return (
    <Box
      bgImg={"/Tutor.jpg"}
      bgSize="cover"
      h="100vh"
      display="flex"
      alignItems="flex-start"
    >
      <Container
        textAlign={"left"}
        maxW="container.lg"
        width={"100%"}
        h="100vh"
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"flex-end"}
        alignItems={"flex-start"}
        paddingBottom={200}
      >
        <Text fontSize="5xl" color="Black">
          <strong>Great Teaching</strong> Starts with
        </Text>
        <Text fontSize="5xl" color="Black">
          <strong>Great Tutors</strong>
        </Text>
        <Button
          p={4}
          colorScheme="green"
          mt={2}
          onClick={redirectToDashboard}
        >
          Get Started
        </Button>
      </Container>
    </Box>
  );
};

export default Hero;
