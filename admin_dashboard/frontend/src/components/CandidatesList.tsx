import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Button,
  Flex,
  Heading,
  HStack,
  Spacer,
  VStack,
  useToast
} from '@chakra-ui/react';
import { userApi } from '../services/userApi';
import { User } from '../services/types';

const CandidatesList = () => {
  const [candidates, setCandidates] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // display candidates from database
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await userApi.candidates();
      setCandidates(data);
    } catch (err) {
      setError('Failed to fetch candidates');
      console.error('Error fetching candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  // blocking user
  const handleBlockUser = async (id: number) => {
    try {
      const result = await userApi.blockUser(id);
      if (result.success) {
        // update state to show user is now blocked
        setCandidates(prevCandidates =>
          prevCandidates.map(candidate =>
            candidate.id === id.toString()
              ? { ...candidate, isBlocked: true }
              : candidate
          )
        );

        toast({
          title: "User Blocked",
          description: result.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Block Failed",
          description: result.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error blocking user:', err);
      toast({
        title: "Error",
        description: "Failed to block user",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUnblockUser = async (id: number) => {
    try {
      const result = await userApi.unblockUser(id);
      if (result.success) {
        // update the state to show that the user is now unblocked
        setCandidates(prevCandidates =>
          prevCandidates.map(candidate =>
            candidate.id === id.toString()
              ? { ...candidate, isBlocked: false }
              : candidate
          )
        );

        toast({
          title: "User Unblocked",
          description: result.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Unblock Failed",
          description: result.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error('Error unblocking user:', err);
      toast({
        title: "Error",
        description: "Failed to unblock user",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box p={6} display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
        <Text ml={4}>Loading candidates...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="100%" w="100%">
      <Heading size="lg" mb={6}>Candidates List</Heading>

      {candidates.length === 0 ? (
        <Text color="gray.500">No candidates found.</Text>
      ) : (
        <Box w="100%">
          <Accordion allowMultiple w="100%">
            {candidates.map((candidate) => (
              <AccordionItem key={candidate.id} border="1px" borderColor="gray.300" borderRadius="md" mb={2} bg={candidate.isBlocked ? 'red.50' : 'green.50'}>
                <AccordionButton p={4}>
                  <Box flex="1" textAlign="left">
                    <Flex align="center">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="lg">
                          {candidate.firstName} {candidate.lastName}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          ID: {candidate.id} | {candidate.email}
                        </Text>
                      </VStack>
                      <Spacer />
                      <Badge
                        colorScheme={candidate.isBlocked ? 'red' : 'green'}
                        variant="solid"
                        mr={4}
                      >
                        {candidate.isBlocked ? 'Blocked' : 'Active'}
                      </Badge>
                    </Flex>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4} bg={candidate.isBlocked ? 'red.50' : 'green.50'}>
                  <VStack align="stretch" spacing={3}>
                    <HStack>
                      <Text fontWeight="semibold">Full Name:</Text>
                      <Text>{candidate.firstName} {candidate.lastName}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="semibold">Email:</Text>
                      <Text>{candidate.email}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="semibold">User ID:</Text>
                      <Text>{candidate.id}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="semibold">Status:</Text>
                      <Badge colorScheme={candidate.isBlocked ? 'red' : 'green'}>
                        {candidate.isBlocked ? 'Blocked' : 'Active'}
                      </Badge>
                    </HStack>
                    <Box pt={2}>
                      {candidate.isBlocked ? (
                        <Button
                          colorScheme="green"
                          size="sm"
                          onClick={() => handleUnblockUser(parseInt(candidate.id))}
                        >
                          Unblock User
                        </Button>
                      ) : (
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleBlockUser(parseInt(candidate.id))}
                        >
                          Block User
                        </Button>
                      )}
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      )}

      <Box mt={6} p={4} bg="gray.100" borderRadius="md">
        <Text fontSize="sm" color="gray.600">
          Total candidates: {candidates.length}
        </Text>
      </Box>
    </Box>
  );
};

export default CandidatesList;