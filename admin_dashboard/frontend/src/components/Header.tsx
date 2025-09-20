import React from 'react';
import {
  Box,
  Flex,
  Button,
  Text,
  HStack,
  Link,
} from '@chakra-ui/react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import NextLink from 'next/link';


//links for header
const NAV_LINKS = [
  {
    name: 'Dashboard',
    path: '/adminDashboard',
  },
  {
    name: 'Course Management',
    path: '/adminCourses',
  },
  {
    name: 'User Management',
    path: '/userManagement',
  },
  {
    name: 'Reports',
    path: '/reports',
  }
];

const Header: React.FC = () => {
  const { logOut, currentUser } = useAuth();
  const router = useRouter();
  
  const handleLogout = () => {
    logOut();
    router.push('/');
  };

  return (
    <Box
      as="header"
      bg="white"
      borderBottom="1px"
      borderColor="gray.200"
      px={6}
      py={3}
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="sm"
    >
      <Flex align="center" justify="space-between" maxW="1400px" mx="auto">
        <Text
          fontSize="xl"
          fontWeight="bold"
          minWidth="100px"
        >
        Welcome, {currentUser?.firstName}
        </Text>

        <HStack as="nav" spacing={8} justify="center" flex={1}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              as={NextLink}
              href={link.path}
              px={3}
              py={1}
              rounded="md"
              color={router.pathname === link.path ? 'blue.500' : 'gray.600'}
              fontWeight={router.pathname === link.path ? 'semibold' : 'normal'}
              _hover={{
                textDecoration: 'none',
                color: 'blue.500',
              }}
              transition="all 0.2s"
            >
              {link.name}
            </Link>
          ))}
        </HStack>

        <Button
          colorScheme="red"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          minWidth="100px"
        >
          Log out
        </Button>
      </Flex>
    </Box>
  );
};

export default Header;