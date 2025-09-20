import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  Badge,
  Button,
  Select,
  VStack,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton
} from "@chakra-ui/react";
import { Course, User } from "@/services/api";
import { useState, useRef } from "react";

//props that will be used for adminCourses page
interface CourseProps {
  courses: Course[];
  lecturers: User[];
  onAddCourse: (newCourse: {
    code: string;
    name: string;
    startDate: string;
    endDate: string;
    description: string;
    lecturerId?: string;
  }) => void;
  onEditCourse: (
    code: string, 
    updatedCourse: {
      name: string;
      startDate: string;
      endDate: string;
      description: string;
      lecturerId?: string | null;
    }
  ) => void
  onDeleteCourse: (courseCode: string) => void;
}

// main function that will return what can be seen on admin courses page.
const Courses = ({ courses, lecturers, onAddCourse, onEditCourse, onDeleteCourse }: CourseProps) => {
  
  // add form state
  const [showAddForm, setShowAddForm] = useState(false); // to control when add form should come out
  const [newCourse, setNewCourse] = useState({
    code: "",
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    lecturerId: ""
  });

  // edit form state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    lecturerId: ""
  });

  // states to manage course deletion
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  
  // for form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});

  // function that handles input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setNewCourse(prev => ({ ...prev, [name]: value }));

  //clear error when field is updated
  if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // function to handle edit form
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));

    //clear error when field is updated
    if (editFormErrors[name]) {
        setEditFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // function to ensure fields are non-empty
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newCourse.code) errors.code = "Course code is required";
    if (!newCourse.name) errors.name = "Course name is required";
    if (!newCourse.startDate) errors.startDate = "Start date is required";
    if (!newCourse.endDate) errors.endDate = "End date is required";
    if (!newCourse.description) errors.description = "Description is required";
    
    // check if end date is after start date
    if (newCourse.startDate && newCourse.endDate) {
      const start = new Date(newCourse.startDate);
      const end = new Date(newCourse.endDate);
      if (end < start) {
        errors.endDate = "End date must be after start date";
      }
    }
   setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // function that validates edit form
  const validateEditForm = () => {
    const errors: Record<string, string> = {};
    
    if (!editFormData.name) errors.name = "Course name is required";
    if (!editFormData.startDate) errors.startDate = "Start date is required";
    if (!editFormData.endDate) errors.endDate = "End date is required";
    if (!editFormData.description) errors.description = "Description is required";
    
    // check if end date is after start date
    if (editFormData.startDate && editFormData.endDate) {
      const start = new Date(editFormData.startDate);
      const end = new Date(editFormData.endDate);
      if (end < start) {
        errors.endDate = "End date must be after start date";
      }
    }
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // this handles add course submission
  const handleAddCourse = () => {
    if (validateForm()) {
      onAddCourse(newCourse);
      // Reset form
      setNewCourse({
        code: "",
        name: "",
        startDate: "",
        endDate: "",
        description: "",
        lecturerId: ""
      });
      // this will hide the form after submission
      setShowAddForm(false);
    }
  };

  // this handles edit course submission
  const handleEditCourseSubmit = () => {
    if (!editCourse || !validateEditForm()) return;
    
    onEditCourse(editCourse.code, {
      name: editFormData.name,
      startDate: editFormData.startDate,
      endDate: editFormData.endDate,
      description: editFormData.description,
      lecturerId: editFormData.lecturerId || null
    });
    
    setIsEditModalOpen(false);
    setEditCourse(null);
  };

  // open edit modal with course data
  const openEditModal = (course: Course) => {
    setEditCourse(course);
    
    // Format dates for the input fields (YYYY-MM-DD format)
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    setEditFormData({
      name: course.name,
      startDate: formatDate(String(course.startDate)),
      endDate: formatDate(String(course.endDate)),
      description: course.description,
      lecturerId: course.lecturerId ? course.lecturerId.toString() : ""
    });
    
    setIsEditModalOpen(true);
  };


  // toggle add form visibility
  const toggleAddCourseForm = () => {
    setShowAddForm(!showAddForm);
  };

  return (
    <>
      {/* This is for printing courses using Accordion */}
      <Box bg="gray.100" p={4} borderRadius="md" width="100%">
        <Accordion allowToggle width="100%">
          {courses.map((course) => (
            <AccordionItem 
            key={course.code} 
            borderWidth="1px" 
            borderRadius="md" 
            mb={3} 
            bg="white"
            boxShadow="sm"
            >
              <h2>
                <AccordionButton _expanded={{ bg: 'blue.50' }}>
                  <Box flex="1" textAlign="left" fontWeight="medium">
                    {course.code}: {course.name}
                  </Box>
                  <Badge colorScheme={course.lecturerId ? "green" : "yellow"} mr={3}>
                    {course.lecturerId ? "Assigned" : "Unassigned"}
                  </Badge>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel p={6} pb={4}>
                <VStack align="flex-start" spacing={2} width="100%">
                  <Text><strong>Course Code:</strong> {course.code}</Text>
                  <Text><strong>Course Name:</strong> {course.name}</Text>
                  <Text><strong>Description:</strong> {course.description}</Text>
                  <Text><strong>Start Date:</strong> {new Date(course.startDate).toLocaleDateString()}</Text>
                  <Text><strong>End Date:</strong> {new Date(course.endDate).toLocaleDateString()}</Text>
                  <Text>
                    <strong>Lecturer:</strong>{" "}
                    {(() => {
                      if (!course.lecturerId) return "Unassigned";
                      const lecturer = lecturers.find(l => parseInt(l.id) === course.lecturerId);
                      return lecturer ? `${lecturer.firstName} ${lecturer.lastName}` : "Unknown Lecturer";
                    })()}
                  </Text>
                  
                  <Flex mt={3} gap={3}>
                    <Button 
                      colorScheme="blue"
                      onClick={() => openEditModal(course)}
                      >
                      Edit Course
                    </Button>
                    
                    <Button 
                      colorScheme="red"
                      onClick={() => {
                        setCourseToDelete(course.code);
                        onOpen();
                      }}
                      >
                      Delete Course
                    </Button>
                  </Flex>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
        {/* This is for adding a new course */}
        <Button 
          mb={4} 
          colorScheme="blue" 
          onClick={toggleAddCourseForm}
          width="100%"
          >
        {showAddForm ? "Cancel" : "Add New Course"}
        </Button>
        {showAddForm && (
          <Box 
          borderWidth="1px" 
          borderRadius="md" 
          bg="white" 
          p={6} 
          mb={4}
          boxShadow="md"
          >
          <VStack spacing={4} align="stretch">
            <FormControl isRequired isInvalid={!!formErrors.code}>
              <FormLabel>Course Code</FormLabel>
              <Input 
                name="code"
                value={newCourse.code}
                onChange={handleInputChange}
                placeholder="e.g. COSC0001"
                />
              <FormErrorMessage>{formErrors.code}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.name}>
              <FormLabel>Course Name</FormLabel>
              <Input 
                name="name"
                value={newCourse.name}
                onChange={handleInputChange}
                placeholder="e.g. Full Stack Development"
                />
              <FormErrorMessage>{formErrors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.startDate}>
              <FormLabel>Start Date</FormLabel>
              <Input 
                name="startDate"
                type="date"
                value={newCourse.startDate}
                onChange={handleInputChange}
                />
              <FormErrorMessage>{formErrors.startDate}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!formErrors.endDate}>
              <FormLabel>End Date</FormLabel>
              <Input 
                name="endDate"
                type="date"
                value={newCourse.endDate}
                onChange={handleInputChange}
                />
              <FormErrorMessage>{formErrors.endDate}</FormErrorMessage>
            </FormControl>
            
            <FormControl isRequired isInvalid={!!formErrors.description}>
              <FormLabel>Description</FormLabel>
              <Textarea 
                name="description"
                value={newCourse.description}
                onChange={handleInputChange}
                placeholder="Enter course description"
                rows={4}
                />
              <FormErrorMessage>{formErrors.description}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Assign Lecturer (Optional)</FormLabel>
              <Select
                name="lecturerId"
                value={newCourse.lecturerId}
                onChange={handleInputChange}
                placeholder="Select lecturer"
                >
                {lecturers.map(lecturer => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.firstName} {lecturer.lastName}
                  </option>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              colorScheme="green" 
              onClick={handleAddCourse}
              mt={2}
              >
              Create Course
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
    {/* Dialog used for deleting a course */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          onClose();
          setCourseToDelete(null);
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Course
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete course {courseToDelete}? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={() => {
                  onClose();
                  setCourseToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={() => {
                  if (courseToDelete) {
                    onDeleteCourse(courseToDelete);
                    onClose();
                    setCourseToDelete(null);
                  }
                }} 
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      
      {/* This is for editing Course Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Course: {editCourse?.code}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired isInvalid={!!editFormErrors.name}>
                <FormLabel>Course Name</FormLabel>
                <Input 
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                />
                <FormErrorMessage>{editFormErrors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!editFormErrors.startDate}>
                <FormLabel>Start Date</FormLabel>
                <Input 
                  name="startDate"
                  type="date"
                  value={editFormData.startDate}
                  onChange={handleEditInputChange}
                />
                <FormErrorMessage>{editFormErrors.startDate}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!editFormErrors.endDate}>
                <FormLabel>End Date</FormLabel>
                <Input 
                  name="endDate"
                  type="date"
                  value={editFormData.endDate}
                  onChange={handleEditInputChange}
                />
                <FormErrorMessage>{editFormErrors.endDate}</FormErrorMessage>
              </FormControl>
              
              <FormControl isRequired isInvalid={!!editFormErrors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea 
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  rows={4}
                />
                <FormErrorMessage>{editFormErrors.description}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Assigned Lecturer</FormLabel>
                <Select
                  name="lecturerId"
                  value={editFormData.lecturerId}
                  onChange={handleEditInputChange}
                  placeholder="Select lecturer"
                >
                  {lecturers.map(lecturer => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.firstName} {lecturer.lastName}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleEditCourseSubmit}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  </>
  );
};

export default Courses;