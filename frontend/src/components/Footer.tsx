import React from "react";
import { Flex, Text, Stack, Box } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box
      as="footer"
      bg="green.200"
      padding={"1em"}
      position="relative"
      minWidth="100%"
      mt="auto"
    >
      <Flex justify="space-between">
        <Stack spacing={1}>
          <Text color="blackAlpha">Contact Us: </Text>
          <Text as="p" color="blackAlpha">
            s3950166@student.rmit.edu.au
          </Text>
          <Text as="p" color="blackAlpha">
            s4040610@student.rmit.edu.au
          </Text>
        </Stack>
        <Text color="blackAlpha">© TeachTeam 2025</Text>
      </Flex>
    </Box>
  );
};

export default Footer;