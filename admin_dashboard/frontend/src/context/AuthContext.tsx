// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { User, AuthPayload } from "../services/types";
import { authApi } from "../services/authApi";


// helper function to handle errors
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

interface AuthContextType {
  currentUser: User | undefined;
  isLoading: boolean;
  error: string;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ authPayload: AuthPayload }>;
  logOut: () => void;
  clearError: () => void;
  isAuthReady: boolean;
}

// A context for authentication
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | undefined>(undefined);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  // Initialize from localStorage
  useEffect(() => {

    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsAuthReady(true);

  }, []);

  const clearError = () => {
    setError("");
  }

  // this function signs in user by checking email and password validity
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(""); try {
      // attempt api login
      const checkResponse = await authApi.login(email, password);

      if (!checkResponse) {
        setError("No response from server.");
        setIsLoading(false);
        return {
          authPayload: {
            message: "No response from server.",
            success: false,
            token: "",
            user: undefined
          }
        }
      }

      //login is successful
      if (checkResponse.success && checkResponse.user && checkResponse.token) {
        const newUser = checkResponse.user;

        setCurrentUser(newUser);
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        localStorage.setItem("authToken", checkResponse.token);
        console.log("Authentication successful");

        // user is redirected based on their role
        if (router.isReady) {
          router.push("/adminDashboard");
        }

        setIsLoading(false);
        return {
          authPayload: {
            message: checkResponse.message,
            success: checkResponse.success,
            token: checkResponse.token,
            user: checkResponse.user
          }

        }
      } else {
        setError(checkResponse.message);
        setIsLoading(false);
        return {
          authPayload: {
            message: checkResponse.message,
            success: checkResponse.success,
            token: "",
            user: undefined
          }
        }
      }

    } catch (error: unknown) {
      console.error("Unexpected error during authentication:", error);
      const errorMsg = `An unexpected error occurred: ${getErrorMessage(error)}`;
      setError(errorMsg);
      setIsLoading(false);
      return {
        authPayload: {
          message: errorMsg,
          success: false,
          token: "",
          user: undefined
        }
      };
    }
  };

  // Function that logs out the user
  const logOut = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    setCurrentUser(undefined);
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
