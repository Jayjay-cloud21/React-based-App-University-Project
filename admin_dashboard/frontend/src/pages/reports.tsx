import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { applicationApi, userApi } from '@/services';
import { Application, User } from '@/services/types';
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Alert, Badge, Box, Button, ButtonGroup, Flex, Heading, HStack, Spacer, Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VStack } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import React, { useEffect, useState } from 'react'
import AdminAuth from "@/components/AdminAuth";
import { useRouter } from "next/router";

const Reports = () => {
    const [allSelections, setAllSelections] = useState<Application[]>([]);
    const [unselectedCandidates, setUnselectedCandidates] = useState<User[]>([]);
    const [highSelected, setHighSelected] = useState<User[]>([]);

    const [loadingSelections, setLoadingSelections] = useState<boolean>(true);
    const [loadingUnselected, setLoadingUnselected] = useState<boolean>(true);
    const [loadingHighSelected, setLoadingHighSelected] = useState<boolean>(true);

    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    // for h)i) requirement: fetch all course selections
    const fetchAllSelections = async () => {
        try {
            setLoadingSelections(true);
            const data = await applicationApi.getAllCourseSelections();
            setAllSelections(data);
        } catch (error) {
            console.error("Error fetching all selections:", error);
            setError("Failed to fetch all selections");
        } finally {
            setLoadingSelections(false);
        }
    };

    // helper function to group selections by course
    const groupSelectionsByCourse = () => {
        const groupedSelections: { [courseCode: string]: Application[] } = {};

        allSelections.forEach(selection => {
            if (!groupedSelections[selection.courseCode]) {
                groupedSelections[selection.courseCode] = [];
            }
            groupedSelections[selection.courseCode].push(selection);
        });

        return groupedSelections;
    };

    // for h)iii) requirement: fetch unselected candidates
    const fetchUnselectedCandidates = async () => {
        try {
            setLoadingUnselected(true);
            const data = await userApi.getUnselectedCandidates();
            setUnselectedCandidates(data);

        } catch (error) {
            console.error("Error fetching unselected candidates:", error);
            setError("Failed to fetch unselected candidates");
        } finally {
            setLoadingUnselected(false);
        }
    };

    // for h)ii) requirement: fetch candidates with more than 3 selections
    const fetchHighSelected = async () => {
        try {
            setLoadingHighSelected(true);
            const data = await userApi.getCandidatesWithManySelections();
            setHighSelected(data);
        } catch (error) {
            console.error("Error fetching high selected candidates:", error);
            setError("Failed to fetch high selected candidates");
        } finally {
            setLoadingHighSelected(false);
        }
    };

    // fetch all data when component loads
    useEffect(() => {
        const loadAllData = async () => {
            await fetchAllSelections();
            await fetchUnselectedCandidates();
            await fetchHighSelected();
        }

        loadAllData();
    }, []);

    // to refresh data
    const refreshAll = async () => {
        setError(null);
        await Promise.all([
            fetchAllSelections(),
            fetchUnselectedCandidates(),
            fetchHighSelected()
        ]);
    };

    const totalSelected = allSelections.length;
    const uniqueCourses = new Set(allSelections.map(selection => selection.courseCode)).size;

    // show error message if any of the data fetching failed
    if (error && !allSelections.length && !unselectedCandidates.length && !highSelected.length) {
        return (
            <Box p={6} minHeight="84vh" bg="gray.50">
                <Alert status="error" mb={4}>
                    {error}
                </Alert>
                <Button onClick={refreshAll} isLoading={loadingSelections || loadingUnselected || loadingHighSelected}>
                    Retry Loading Data
                </Button>
            </Box>
        );
    }

    return (
        <>
            <AdminAuth>

                <Header />
                <Box p={6} minHeight="85vh" bg="gray.50">
                    <Flex justify="space-between" align="center" mb="6">
                        <Heading>
                            Teach Team Report
                        </Heading>
                        <ButtonGroup>
                            <Button variant="outline" onClick={refreshAll} isLoading={loadingSelections || loadingUnselected || loadingHighSelected}>
                                Refresh Data
                            </Button>
                        </ButtonGroup>
                    </Flex>
                    <Box width="100%" mb={4}>
                        <Button
                            leftIcon={<ArrowBackIcon />}
                            variant="outline"
                            colorScheme="blue"
                            onClick={() => router.push("/adminDashboard")}
                        >
                            Back to Dashboard
                        </Button>
                    </Box>
                    <Tabs variant="enclosed" colorScheme="blue">
                        <TabList>
                            <Tab>
                                Course Selections
                                <Badge ml={2} colorScheme="blue">
                                    {loadingSelections ? <Spinner size={"xs"} /> : totalSelected}
                                </Badge>
                            </Tab>
                            <Tab>
                                High Selection Candidates
                                <Badge ml={2} colorScheme="green">
                                    {loadingHighSelected ? <Spinner size={"xs"} /> : highSelected.length}
                                </Badge>
                            </Tab>
                            <Tab>
                                Unselected Candidates
                                <Badge ml={2} colorScheme="red">
                                    {loadingUnselected ? <Spinner size={"xs"} /> : unselectedCandidates.length}
                                </Badge>
                            </Tab>
                        </TabList>
                        {/* course selections */}
                        <TabPanels>
                            <TabPanel>
                                <Flex justify={"space-between"} align="center" mb="4">
                                    <Heading size="md"> Selected Candidates by Course </Heading>
                                </Flex>

                                {loadingSelections ? (
                                    <Flex justify={"center"} p={8}>
                                        <Spinner size="xl" />
                                    </Flex>
                                ) : allSelections.length === 0 ? (
                                    <Box p="4" bg="gray.100" borderRadius="md" textAlign="center">
                                        <Text color="gray.500">No course selections found.</Text>
                                    </Box>
                                ) : (
                                    <Box>
                                        {/* summary information */}
                                        <Box p="4" bg="blue.50" borderRadius="md" mb="6" boxShadow="sm">
                                            <HStack spacing={8}>
                                                <Text><strong>Total Selections:</strong> {totalSelected}</Text>
                                                <Text><strong>Courses with Selections:</strong> {uniqueCourses}</Text>
                                            </HStack>
                                        </Box>

                                        {/* course accordion group */}
                                        <Accordion allowMultiple w="100%">
                                            {Object.entries(groupSelectionsByCourse()).map(([courseCode, selections]) => {
                                                // get the  course info from first selection
                                                const courseInfo = selections[0]?.course;
                                                const tutorCount = selections.filter(s => s.type === 'Tutor').length;
                                                const labAssistantCount = selections.filter(s => s.type === 'Lab Assistant').length;

                                                return (
                                                    <AccordionItem
                                                        key={courseCode}
                                                        border="1px"
                                                        borderColor="gray.300"
                                                        borderRadius="md"
                                                        mb={2}
                                                    >
                                                        <AccordionButton p={4}>
                                                            <Box flex="1" textAlign="left">
                                                                <Flex align="center">
                                                                    <VStack align="start" spacing={1}>
                                                                        <Text fontWeight="bold" fontSize="lg">
                                                                            {courseInfo?.name || `Course ${courseCode}`}
                                                                        </Text>
                                                                        <Text fontSize="sm" color="gray.600">
                                                                            Code: {courseCode} | {selections.length} selected candidate(s)
                                                                        </Text>
                                                                    </VStack>
                                                                    <Spacer />
                                                                    <HStack spacing={2} mr={4}>
                                                                        <Badge colorScheme="blue" variant="solid">
                                                                            {tutorCount} Tutors
                                                                        </Badge>
                                                                        <Badge colorScheme="purple" variant="solid">
                                                                            {labAssistantCount} Lab Assistants
                                                                        </Badge>
                                                                    </HStack>
                                                                </Flex>
                                                            </Box>
                                                            <AccordionIcon />
                                                        </AccordionButton>

                                                        <AccordionPanel pb={4}>
                                                            <VStack align="stretch" spacing={4}>
                                                                {/* course details */}
                                                                <Box p={3} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
                                                                    <HStack>
                                                                        <Text fontWeight="semibold">Course Name:</Text>
                                                                        <Text>{courseInfo?.name || 'N/A'}</Text>
                                                                    </HStack>
                                                                    <HStack>
                                                                        <Text fontWeight="semibold">Course Code:</Text>
                                                                        <Text>{courseCode}</Text>
                                                                    </HStack>
                                                                    <HStack>
                                                                        <Text fontWeight="semibold">Total Selected:</Text>
                                                                        <Text>{selections.length} candidates</Text>
                                                                    </HStack>
                                                                </Box>

                                                                <Box>
                                                                    <Heading size="sm" mb={2} color="blue.600">
                                                                        Selected Candidates ({selections.length})
                                                                    </Heading>
                                                                    <VStack align="stretch" spacing={2}>
                                                                        {selections.map(selection => (
                                                                            <Box
                                                                                key={`${selection.applicationId}-${selection.type}`}
                                                                                p={3}
                                                                                bg={selection.type === 'Tutor' ? 'green.50' : 'purple.50'}
                                                                                borderRadius="md"
                                                                                border="1px"
                                                                                borderColor={selection.type === 'Tutor' ? 'green.200' : 'purple.200'}
                                                                            >
                                                                                <Flex justify="space-between" align="center">
                                                                                    <VStack align="start" spacing={0}>
                                                                                        <Text fontWeight="medium">
                                                                                            {selection.user?.firstName} {selection.user?.lastName}
                                                                                        </Text>
                                                                                        <Text fontSize="sm" color="gray.600">
                                                                                            {selection.user?.email}
                                                                                        </Text>
                                                                                        <Text fontSize="xs" color="gray.500">
                                                                                            Application ID: {selection.applicationId}
                                                                                        </Text>
                                                                                    </VStack>
                                                                                    <Badge colorScheme={selection.type === 'Tutor' ? 'green' : 'purple'}>
                                                                                        {selection.type}
                                                                                    </Badge>
                                                                                </Flex>
                                                                            </Box>
                                                                        ))}
                                                                    </VStack>
                                                                </Box>
                                                            </VStack>
                                                        </AccordionPanel>
                                                    </AccordionItem>
                                                );
                                            })}
                                        </Accordion>
                                    </Box>
                                )}
                            </TabPanel>

                            <TabPanel>
                                <Flex justify={"space-between"} align="center" mb="4">
                                    <Heading size="md">High Selection Candidates</Heading>
                                </Flex>

                                {loadingHighSelected ? (
                                    <Flex justify={"center"} p={8}>
                                        <Spinner size="xl" />
                                    </Flex>
                                ) : highSelected.length === 0 ? (
                                    <Box p="4" bg="gray.100" borderRadius="md" textAlign="center">
                                        <Text color="gray.500">No high selection candidates found.</Text>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Box p="4" bg="green.50" borderRadius="md" mb="6" boxShadow="sm">
                                            <HStack spacing={8}>
                                                <Text><strong>Total:</strong> {highSelected.length}</Text>
                                                <Text><strong>Blocked Candidates:</strong> {highSelected.filter(c => c.isBlocked).length}</Text>
                                                <Text><strong>Active Candidates:</strong> {highSelected.filter(c => !c.isBlocked).length}</Text>
                                            </HStack>
                                        </Box>

                                        {/* candidates List */}
                                        <VStack align="stretch" spacing={3}>
                                            {highSelected.map(candidate => {
                                                const totalApplications = candidate.applications?.length || 0;
                                                const selectedApplications = candidate.applications?.filter(app =>
                                                    allSelections.some(selection => selection.applicationId === app.applicationId)
                                                ) || [];
                                                const selectionRate = totalApplications > 0 ?
                                                    ((selectedApplications.length / totalApplications) * 100).toFixed(1) : '0.0';

                                                return (
                                                    <Box
                                                        key={candidate.id}
                                                        p={4}
                                                        bg="white"
                                                        borderRadius="md"
                                                        border="1px"
                                                        borderColor={candidate.isBlocked ? "red.200" : "green.200"}
                                                        boxShadow="sm"
                                                    >
                                                        <Flex justify="space-between" align="center">
                                                            <VStack align="start" spacing={1} flex={1}>
                                                                <Flex align="center" gap={2}>
                                                                    <Text fontWeight="bold" fontSize="lg">
                                                                        {candidate.firstName} {candidate.lastName}
                                                                    </Text>
                                                                    {candidate.isBlocked && (
                                                                        <Badge colorScheme="red" variant="solid">
                                                                            Blocked
                                                                        </Badge>
                                                                    )}
                                                                </Flex>
                                                                <Text fontSize="sm" color="gray.600">
                                                                    {candidate.email}
                                                                </Text>
                                                                <HStack spacing={4}>
                                                                    <Text fontSize="sm" color="gray.800">
                                                                        <strong>Applications:</strong> {totalApplications}
                                                                    </Text>
                                                                    <Text fontSize="sm" color="gray.800">
                                                                        <strong>Selected:</strong> {selectedApplications.length}
                                                                    </Text>
                                                                    <Text fontSize="sm" color="green.600" fontWeight="semibold">
                                                                        <strong>Selection Rate:</strong> {selectionRate}%
                                                                    </Text>
                                                                </HStack>
                                                            </VStack>
                                                            <VStack align="end" spacing={1}>
                                                                <Text fontSize="xs" color="gray.500">
                                                                    User ID: {candidate.id}
                                                                </Text>
                                                            </VStack>
                                                        </Flex>
                                                    </Box>
                                                );
                                            })}
                                        </VStack>

                                    </Box>
                                )}
                            </TabPanel>

                            <TabPanel>
                                <Flex justify={"space-between"} align="center" mb="4">
                                    <Heading size="md">Unselected Candidates</Heading>
                                </Flex>

                                {loadingUnselected ? (
                                    <Flex justify={"center"} p={8}>
                                        <Spinner size="xl" />
                                    </Flex>
                                ) : unselectedCandidates.length === 0 ? (
                                    <Box p="4" bg="gray.100" borderRadius="md" textAlign="center">
                                        <Text color="gray.500">No unselected candidates found.</Text>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Box p="4" bg="red.50" borderRadius="md" mb="6" boxShadow="sm">
                                            <HStack spacing={8}>
                                                <Text><strong>Total Unselected:</strong> {unselectedCandidates.length}</Text>
                                                <Text><strong>Blocked Candidates:</strong> {unselectedCandidates.filter(c => c.isBlocked).length}</Text>
                                                <Text><strong>Active Candidates:</strong> {unselectedCandidates.filter(c => !c.isBlocked).length}</Text>
                                            </HStack>
                                        </Box>

                                        {/* candidates List */}
                                        <VStack align="stretch" spacing={3}>
                                            {unselectedCandidates.map(candidate => {

                                                return (
                                                    <Box
                                                        key={candidate.id}
                                                        p={4}
                                                        bg="white"
                                                        borderRadius="md"
                                                        border="1px"
                                                        borderColor={candidate.isBlocked ? "red.200" : "gray.200"}
                                                        boxShadow="sm"
                                                    >
                                                        <Flex justify="space-between" align="center">
                                                            <VStack align="start" spacing={1} flex={1}>
                                                                <Flex align="center" gap={2}>
                                                                    <Text fontWeight="bold" fontSize="lg">
                                                                        {candidate.firstName} {candidate.lastName}
                                                                    </Text>
                                                                    {candidate.isBlocked && (
                                                                        <Badge colorScheme="red" variant="solid">
                                                                            Blocked
                                                                        </Badge>
                                                                    )}
                                                                </Flex>
                                                                <Text fontSize="sm" color="gray.600">
                                                                    {candidate.email}
                                                                </Text>
                                                                <Text fontSize="md" color="gray.800">
                                                                    Applications: {candidate.applications?.length || 0}
                                                                </Text>
                                                            </VStack>
                                                            <VStack align="end" spacing={1}>
                                                                <Text fontSize="xs" color="gray.500">
                                                                    User ID: {candidate.id}
                                                                </Text>
                                                            </VStack>
                                                        </Flex>
                                                    </Box>
                                                );
                                            })}
                                        </VStack>
                                    </Box>
                                )}
                            </TabPanel>
                        </TabPanels>
                    </Tabs>

                </Box>
                <Footer />
            </AdminAuth>
        </>
    )
}

export default Reports