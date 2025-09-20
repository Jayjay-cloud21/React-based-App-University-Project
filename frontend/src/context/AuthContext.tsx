// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import NewUser from "@/types/newUser";
import { userApi } from "@/services/userApi";


interface AuthContextType {
  currentUser: NewUser | null;
  isLoading: boolean;
  error: string;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string; user?: NewUser }>;
  logOut: () => void;
  clearError: () => void;
  isAuthReady: boolean;
}

// A context for authentication
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<NewUser | null>(null);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  // Initialize from localStorage
  useEffect(() => {

    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.email !== "admin") {
        setCurrentUser(parsedUser);
      }
    }
    setIsAuthReady(true);

  }, []);

  // Function to validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Function checks for errors in the email and if password is equal to the stored password
  const hasErrors = (email: string) => {
    if (email != "admin" && !validateEmail(email)) {
      return {
        valid: false,
        message: 'Please enter a valid email ("example@gmail.com")',
      };
    }
    return { valid: true, message: "" };
  };

  const clearError = () => {
    setError("");
  }

  // this function signs in user by checking email and password validity
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    const validation = hasErrors(email);
    if (!validation.valid) {
      setError(validation.message);
      setIsLoading(false);
      return { success: false, message: validation.message };
    }

    try {
      // attempt api login
      const checkResponse = await userApi.checkUser(email, password);

      if (!checkResponse) {
        const errorMsg = "No account found with this email address";
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, message: errorMsg };
      }

      //login is successful
      if (checkResponse.data && checkResponse.data.success) {
        const newUser = checkResponse.data.user;

        setCurrentUser(newUser);
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        console.log("Authentication successful");
        console.log("User role:", newUser.role);

        // user is redirected based on their role
        if (router.isReady) {
          if (newUser.role === "Candidate") {
            console.log("Redirecting to candidate page...");
            router.push("/candidate");
          } else if (newUser.role === "Lecturer") {
            console.log("Redirecting to lecturer page...");
            router.push("/lecturer");
          } else if (newUser.role === "Admin") {
            console.log("Redirecting to admin page...");
            window.location.href = "http://localhost:3010";
          }
        }

        setIsLoading(false);
        return { success: true, message: "", user: newUser };
      } else {
        // show the error message from the API response
        const errorMsg = checkResponse.message || "Invalid email or password";
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, message: errorMsg };
      }

    } catch (error: unknown) {
      console.error("Unexpected error during authentication:", error);

      // handle specific HTTP error codes
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        const status = axiosError.response.status;
        let errorMsg = "An error occurred during login";

        // handle status codes
        if (status === 400) {
          errorMsg = "Invalid credentials. Please check your email and password.";
        } else if (status === 401) {
          errorMsg = "Invalid email or password";
        } else if (status === 403) {
          errorMsg = "Your account has been blocked. Please contact support.";
        } else if (status === 404) {
          errorMsg = "Account not found";
        } else if (status === 500) {
          errorMsg = "Server error. Please try again later.";
        }

        setError(errorMsg);
        setIsLoading(false);
        return { success: false, message: errorMsg };
      }

      const errorMsg = "An unexpected error occurred. Please try again.";
      setError(errorMsg);
      setIsLoading(false);
      return { success: false, message: errorMsg };
    }
  };

  // Function that logs out the user
  const logOut = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    setCurrentUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoading,
        error,
        signIn,
        logOut,
        clearError,
        isAuthReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Function that returns the context value
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
