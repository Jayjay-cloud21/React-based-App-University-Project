import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "@/context/AuthContext";
import { CandContextProvider } from "@/context/CandidateContext";
import { LectProvider } from "@/context/LectContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <AuthProvider>
        <CandContextProvider>
        <LectProvider>
          <Component {...pageProps} />
        </LectProvider>
        </CandContextProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}
