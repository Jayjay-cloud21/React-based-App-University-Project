import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Information from "@/components/Information";
import Hero from "@/components/Hero";
import { useEffect, useState } from "react";
import NewUser from "@/types/newUser";


const Index = () => {
  const [navLinks, setNavLinks] = useState<{ label: string; href: string; }[]>([]);
  const [, setCurrentUser] = useState<NewUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    // checks if user is logged in
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);

      console.log("Current User:", parsedUser);
      console.log("Current User Role:", parsedUser.role);

      const links: { label: string; href: string; }[] = [];

      if (parsedUser.role === "Lecturer") {
        links.push({ label: "Dashboard", href: "/lecturer" }, { label: "Selected Applications", href: "/lecturer/selected" }, { label: "Search Applications", href: "/lecturer/searchTutors" });
      } else if (parsedUser.role === "Candidate") {
        links.push({ label: "Dashboard", href: "/candidate" }, { label: "My Profile", href: "/candidate/profile" });
      }
      setNavLinks(links);
    } else {
      setCurrentUser(null);
      setNavLinks([]);
    }
  }, []);

  return (
    <>
      <Header navLinks={navLinks} />
      <Hero />
      <Information header="Welcome to TeachTeam!">
        We are proud to introduce TeachTeam (TT), a web-based platform designed to streamline
        the selection and hiring of part time or full time tutors for courses within the school of Computer Science.
        The TT system is developed using React Typescript to deliver a responsive, user friendly prototype.
        This platform supports smooth and meaningful interactions between tutor applicants and lecturers.
        Tutor applicants can easily apply by filling out a form showcasing their skills, academic qualifications, and teaching experiences,
        while lecturers can efficiently review, comment on and select qualified candidates that best fit their course needs.
      </Information>

      <Footer />
    </>
  );
};

export default Index;
