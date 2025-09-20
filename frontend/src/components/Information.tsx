import React from "react";
import { Box } from "@chakra-ui/react";

interface InformationProps {
  // Information component props
  header?: string;
  children?: string;
}

const Information = ({ header, children }: InformationProps) => {
  return (
    <Box bg="gray.100" px="5%" py={12} >
      <Box fontSize="4xl" fontWeight="bold" mb={4}>
        {header}
      </Box>
      <Box
        fontSize="2xl"
        mb={4}
        lineHeight="tall"
        color="gray.700"
        textAlign="justify"
      >
        {children}
      </Box>
    </Box >
  );
};

export default Information;
