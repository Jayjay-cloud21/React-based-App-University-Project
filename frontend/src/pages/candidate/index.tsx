import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Courses from "@/components/Courses";
import { Flex, Text } from "@chakra-ui/react";
import CandidateAuth from "@/components/CandidateAuth";
import {useAuth} from "@/context/AuthContext";


const navLinks = [{label: "My Profile", href: "/candidate/profile"}, { label: "Dashboard", href: "/candidate" }];

const Candidate = () => {
  const {currentUser} = useAuth();
  return (
    <>
      <CandidateAuth>
          <Header navLinks={navLinks} />
          <Flex
            direction="column"
            align="center"
            justify="center"
            px={{ base: 4, md: 60 }}
            py={10}
            pb={-10}
            bg="gray.100"
          >
            <Text fontSize="4xl" fontWeight="bold" mb={4}>
              {`Welcome to the Candidate Dashboard, ${currentUser?.firstName} ${currentUser?.lastName}`}
            </Text>
            <Text mb={6}>
              To get started, click on a course to apply as a Tutor or Lab Assistant for that course.
            </Text>
          </Flex>
          <Courses destination="/candidate" />
          <Footer />
      </CandidateAuth>
    </>
  );
};

export default Candidate;
