import Header from "@/components/Header";
import { Container, Heading, VStack, Flex, Box, Button } from "@chakra-ui/react";
import Footer from "@/components/Footer";
import CandidatesList from "@/components/CandidatesList";
import AdminAuth from "@/components/AdminAuth";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
// import { useState } from "react";
const Index = () => {
  const router = useRouter();
  return (
    <>
    <AdminAuth>
      <Header/>

      <Flex direction="column" align="center" justify="center" minHeight="84vh" bg="gray.50">
        <Container maxW="container.lg" py={8}>
          <VStack spacing={8}>
            <Heading as="h1" size="xl" textAlign="center">
              User Management
            </Heading>
            <Box width="100%" mb={4}>
                <Button
                leftIcon={<ArrowBackIcon />}
                variant="outline"
                colorScheme="blue"
                onClick={() => router.push("/adminDashboard")}
                >
                Back to Dashboard
                </Button>
            </Box>
            <CandidatesList />
          </VStack>
        </Container>
      </Flex>
      <Footer />
    </AdminAuth>
    </>
  );
};

export default Index;
