import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { Flex, Spinner, Text } from '@chakra-ui/react';

interface Props {
  children: React.ReactNode;
}

const AdminAuth = ({ children }: Props) => {
  const { currentUser, isAuthReady } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userChecked, setUserChecked] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    //  proceed if auth state is ready
    if (!isAuthReady) return;

    const handleAuthCheck = () => {
      if (currentUser === null || currentUser === undefined) {
        // user is not logged in
        setIsRedirecting(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        // user is an admin, allow access
        setUserChecked(true);
        setIsLoading(false);
      }
    };

    // add a small delay for consistent UX
    const authCheckTimeout = setTimeout(handleAuthCheck, 300);
    return () => clearTimeout(authCheckTimeout);
  }, [currentUser, router, isAuthReady]);

  if (isLoading || !userChecked || isRedirecting) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" color="blue.500" />
        <Text ml={4}>
          {isRedirecting ? "Redirecting..." : "Verifying admin access..."}
        </Text>
      </Flex>
    );
  }

  return <>{children}</>
};

export default AdminAuth;