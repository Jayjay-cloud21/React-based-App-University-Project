import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Flex, Spinner, Text } from '@chakra-ui/react'


interface Props {
    children: React.ReactNode;
}

const LecturerAuth = ({ children }: Props) => {
    const { currentUser } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userChecked, setUserChecked] = useState(false);

    useEffect(() => {
        // give some time for currentUser to be loaded from localStorage
        const authCheckTimeout = setTimeout(() => {
            if (currentUser === null) {
                router.push("/signin");
            } else if (currentUser && currentUser.role !== "Lecturer") {
                router.push("/");
            } else {
                setUserChecked(true);
            }
            setIsLoading(false);
        }, 300); // add delay to ensure auth state is loaded

        return () => clearTimeout(authCheckTimeout);
    }, [currentUser, router]);

    if (isLoading || !userChecked) {
        return (
            <Flex justifyContent="center" alignItems="center" height="100vh">
                <Spinner size="xl" color="green.500" />
                <Text ml={4}>Authenticating User...</Text>
            </Flex>
        );
    }

    return (
        <>
            {children}
        </>
    )
}

export default LecturerAuth;