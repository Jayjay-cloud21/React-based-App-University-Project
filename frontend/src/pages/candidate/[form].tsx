import React from "react";
import Form from "@/components/Form";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CandidateAuth from "@/components/CandidateAuth";
import { Flex } from "@chakra-ui/react";


const navLinks = [{ label: "Dashboard", href: "/candidate" }];

const FormPage = () => {
  return (
    <>
      <CandidateAuth>
        <Header navLinks={navLinks} />
        <Flex
          direction="column"
          align="center"
          justify="center"
          py={10}
          pb={10}
          bg="gray.100"
        >
          <Form />
        </Flex>
        <Footer />
      </CandidateAuth>
    </>
  );
};

export default FormPage;
