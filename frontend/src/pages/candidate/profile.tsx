import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CandidateAuth from "@/components/CandidateAuth";
import { Flex } from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import { useCand } from "@/context/CandidateContext";
import ProfileDetails from "@/components/ProfileDetails";


const navLinks = [{ label: "Dashboard", href: "/candidate" }];

const Profile = () => {
  const { currentUser } = useAuth();
  const { candidateApplications, fetchProfiles } = useCand();
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfileData = async () => {
      if (currentUser) {
        try {
          await fetchProfiles();
        } catch (error) {
          console.error("Error fetching profile data:", error);

        } finally {
          setIsLoading(false);
        }
      }
    }

    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);
  return (
    <>
      <CandidateAuth>
        <Header navLinks={navLinks} />
        <Flex
          direction="column"
          align="center"
          justify="center"
          px={{ base: 4, md: 60 }}
          py={10}
          pb={10}
          bg="gray.100"
        >
          <ProfileDetails
            user={currentUser}
            applications={candidateApplications}
            isLoading={isLoading}
          />
        </Flex>
        <Footer />
      </CandidateAuth>
    </>
  );
};

export default Profile;