import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
} from "@chakra-ui/react";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, error, clearError } = useAuth();


  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  // Function that handles the form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <>
      <Box
        p="6"
        py={10}
        borderWidth="1px"
        bg="white"
        opacity={0.95}
        minW={"350px"}

      >
        <Text textAlign="center" fontSize="3xl" mb="50px" data-testid="title">
          Sign In
        </Text>
        {/* Form for user to enter their email and password */}
        <form onSubmit={handleSubmit}>
          <FormControl mb="10px">
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              data-testid="email"
              name="email"
              type="text"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl mb="10px">
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              id="password"
              data-testid="password"
              name="password"
              type="password"
              required
              placeholder="Password"
              mb="10px"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          {error && (
            <Text color="red.500" mb={4} data-testid="error-message">
              {error}
            </Text>
          )}
          <Button type="submit" width="50%" colorScheme="green" name="Sign in" w={"100%"}>
            Sign in
          </Button>
          <Text textAlign="center" mt="20px">
            Don&apos;t have an account?{" "}
            <Text as="a" href="/signup" style={{ color: "blue" }} _hover={{ textDecoration: "underline" }}>
              Sign up
            </Text>
          </Text>
        </form>
      </Box >
    </>
  );
};
