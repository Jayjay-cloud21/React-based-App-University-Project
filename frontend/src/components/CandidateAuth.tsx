import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Flex, Spinner, Text } from '@chakra-ui/react'


interface Props {
    children: React.ReactNode;
}

const CandidateAuth = ({ children }: Props) => {
    const { currentUser, isAuthReady } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userChecked, setUserChecked] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        //  proceed if auth state is ready
        if (!isAuthReady) return;

        const handleAuthCheck = () => {
            if (currentUser === null) {
                setIsRedirecting(true);
                setTimeout(() => {
                    router.push("/signin");
                }, 2000);
            } else if (currentUser && currentUser.role !== "Candidate") {
                setIsRedirecting(true);
                setTimeout(() => {
                    router.push("/");
                }, 1250);
            } else {
                setUserChecked(true);
                setIsLoading(false);
            }
        };

        // add a small delay to make sure the authorisation is complete
        const authCheckTimeout = setTimeout(handleAuthCheck, 300);
        return () => clearTimeout(authCheckTimeout);
    }, [currentUser, router, isAuthReady]);

    if (isLoading || !userChecked || isRedirecting) {
        return (
            <Flex justifyContent="center" alignItems="center" height="100vh">
                <Spinner size="xl" color="green.500" />
                <Text ml={4}>
                    {isRedirecting ? "Redirecting..." : "Loading Files..."}
                </Text>
            </Flex>
        );
    }

    return <>{children}</>

}

export default CandidateAuth;