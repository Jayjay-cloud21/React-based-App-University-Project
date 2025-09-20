import React from "react";
import Signin from "@/components/SignIn";
import { Box, Flex } from "@chakra-ui/react";

const signin = () => {
  return (
      <Box bgSize="cover" h="100vh">
        <Flex align="center" justify="center" height="100%">
          <Signin />
        </Flex>
      </Box>
  );
};

export default signin;
