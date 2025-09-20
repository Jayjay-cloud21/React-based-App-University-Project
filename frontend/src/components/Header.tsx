import React, { useEffect } from "react";
import { Box, Flex, Heading, Button, Text, Avatar, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/router";

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { ChevronDownIcon } from "@chakra-ui/icons";

interface HeaderProps {
  // depending on the user role, the links will be different
  navLinks: {
    label: string;
    href: string;
  }[];
}

const Header = ({ navLinks }: HeaderProps) => {
  const { logOut } = useAuth();
  const router = useRouter();
  const { currentUser } = useAuth();

  const [signedIn, setSignedIn] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      setSignedIn(true);
    }
    else {
      setSignedIn(false);
    }
  }, [currentUser]);


  const navMenuLabel = currentUser?.role === "Lecturer" ? "Lecturer Links" : "Candidate Links";

  return (
    <Box
      as="header"
      position="sticky"
      bg="grey.50"
      boxShadow="sm"
      py={4}
      px={8}
    >
      <Flex maxW="5xl" mx="auto" align="center" justify="space-between">
        {/* Will always be escape hatch */}
        <NextLink href={"/"} passHref>
          <Heading
            as="h1"
            size="lg"
            color="green.500"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{
              color: "green.600",
              transform: "scale(1.05)",
              textShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}
          >
            TeachTeam
          </Heading>
        </NextLink>
        {signedIn && (
          <Text fontSize="md">
            {signedIn && currentUser && `Welcome, ${currentUser.firstName} ${currentUser.lastName}`}
          </Text>
        )}
        <Flex as={"nav"} align="center" gap={4}>
          {signedIn && <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
            >{navMenuLabel}</MenuButton>
            <MenuList>
              {navLinks.map((link) => (
                <NextLink key={link.href} href={link.href} passHref>
                  <MenuItem>
                    {link.label}
                  </MenuItem>
                </NextLink>
              ))}
            </MenuList>
          </Menu>}
          {signedIn ? (
            <>
              {currentUser?.role === "Candidate" && (
                <Link mr={8} href="/candidate/profile" transition="all 0.2s"
                  _hover={{
                    transform: "scale(1.05)",
                  }}>
                  <Avatar size="md" name={`${currentUser?.firstName} ${currentUser?.lastName}`} />
                </Link>
              )}
              <Button
                onClick={() => {
                  logOut();
                }}
                colorScheme="red"
                variant="outline"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" colorScheme="green" size="md" onClick={() => {
                router.push("/signup");
              }}>
                Sign up

              </Button>
              <Button
                onClick={() => {
                  router.push("/signin");
                }}
                colorScheme="green"
                variant="solid"
              >
                Sign in
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
