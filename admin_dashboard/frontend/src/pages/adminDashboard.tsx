import Header from "@/components/Header";
import { Container, Heading, SimpleGrid, Card, CardBody, Text, Button, VStack, Flex } from "@chakra-ui/react";
import Footer from "@/components/Footer";
import Link from "next/link";
import AdminAuth from "@/components/AdminAuth";

const Index = () => {
  return (
    <>
    <AdminAuth>
      <Header />
      <Flex direction="column" align="center" justify="center" minHeight="84vh" bg="gray.50">

        <Container maxW="container.lg" py={8}>
          <VStack spacing={8}>
            <Heading as="h1" size="xl" textAlign="center">
              Admin Dashboard
            </Heading>
            <SimpleGrid columns={3} spacing={6} w="100%">
              <Card>
                <CardBody textAlign="center">
                  <Heading size="md" mb={4}>Course Management</Heading>
                  <Text mb={4}>Add, edit, or delete courses available in a semester</Text>
                  <Link href="/adminCourses">
                    <Button colorScheme="blue" w="100%">
                      Manage Courses
                    </Button>
                  </Link>
                </CardBody>
              </Card>
              <Card>
                <CardBody textAlign="center">
                  <Heading size="md" mb={4}>User Management</Heading>
                  <Text mb={10}>Block or unblock login access for users</Text>
                  <Link href="/userManagement">
                    <Button colorScheme="orange" w="100%">
                      Manage Users
                    </Button>
                  </Link>
                </CardBody>
              </Card>
              <Card>
                <CardBody textAlign="center">
                  <Heading size="md" mb={4}>Teach Team Reports</Heading>
                  <Text mb={10}>Generate and View Reports</Text>
                  <Link href="/reports">
                    <Button colorScheme="green" w="100%">
                      View Reports
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </Container>
      </Flex>
      <Footer />
    </AdminAuth>
    </>
  );
};

export default Index;
