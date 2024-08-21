import "./global.css";
import React, { useEffect, useState } from "react";
import AuthProvider from "../components/authProvider/authProvider";
import { ApolloProvider } from "@apollo/client";
import { useApollo } from "../lib/apollo";
import { AppProps } from "next/app";
import {
  Box,
  ChakraProvider,
  extendTheme,
  IconButton,
  useMediaQuery,
} from "@chakra-ui/react";
import * as gtag from "../lib/gtag";
// import { AiOutlineArrowUp } from "react-icons/ai";
import { FaArrowAltCircleUp } from "react-icons/fa";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import Fonts from "_components/layout/Fonts";

// import { Helmet } from "react-helmet";

function MyApp({ Component, pageProps }: any) {
  const router = useRouter();

  const client = useApollo(pageProps.initialApolloState);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile] = useMediaQuery("(max-width: 1240px)");
  const theme = extendTheme({
    colors: {
      poldit: {
        100: "#ff4d00",
        200: "#FAFF81",
        300: "#FDC49B",
      },
    },

    fonts: {
      malgunHeader: "malgun header, sans-serif",
      malgunBody: "malgun body, sans-serif",
    },
  });

  // Top: 0 takes us all the way back to the top of the page
  // Behavior: smooth keeps it smooth!
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    // Button is displayed after scrolling for 500 pixels
    const toggleVisibility = () => {
      if (window.pageYOffset > 500 && window.innerHeight > 700) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };

    router.events.on(`routeChangeComplete`, handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <AuthProvider>
      <SessionProvider session={pageProps.session}>
        <ApolloProvider client={client}>
          <ChakraProvider theme={theme}>
            <Fonts />
            <Component {...pageProps} />
            {isVisible && !isMobile && (
              <Box position="fixed" bottom="30px" right="30px" cursor="pointer">
                <IconButton
                  aria-label="scrollToTop"
                  isRound={true}
                  size="md"
                  fontSize={"24"}
                  icon={<FaArrowAltCircleUp />}
                  onClick={scrollToTop}
                  borderColor="poldit.100"
                  color="poldit.100"
                  _hover={{ bg: "#ff4d00", color: "white" }}
                  _active={{ outline: "none" }}
                  _focus={{ outline: "none" }}
                />
              </Box>
            )}
          </ChakraProvider>
        </ApolloProvider>
      </SessionProvider>
    </AuthProvider>
  );
}

export default MyApp;
