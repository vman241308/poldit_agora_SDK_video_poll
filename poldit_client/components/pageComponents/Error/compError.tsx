import {
  Flex,
  Box,
  Text,
  Image,
  HStack,
  Stack,
  Center,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { BiErrorCircle } from "react-icons/bi";
import { PoldItActionBtn } from "../Other/Button/brandedItems";
import styles from "./error.module.css";

interface ComponentEror {
  mssg: string;
  fontSize:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "xs"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "9xl";
}

export const ComponentError = ({ mssg, fontSize }: ComponentEror) => {
  const router = useRouter();

  const refreshPg = () => {
    router.reload();
  };

  return (
    <Flex
      h="calc(100vh - 60px)"
      justify="center"
      align="center"
      flexDir={"column"}
    >
      <Box
        className={`${styles.errCtr}`}
        zIndex="2"
        position={"relative"}
        w={{ base: "90%", sm: "90%", md: "30%" }}
        h="30%"
        // boxSize="xs"
        borderRadius="lg"
        boxShadow="lg"
      >
        <Flex
          position={"absolute"}
          w="100%"
          h="80%"
          alignItems={"center"}
          justify={"space-evenly"}
          flexDir="column"
        >
          <Text
            fontSize={fontSize}
            fontWeight={"semibold"}
            color={"poldit.100"}
          >
            {mssg}
          </Text>
        </Flex>
        <Center position={"absolute"} top="70%" w="100%">
          <PoldItActionBtn
            btnLabel="Reload Page"
            btnAction={refreshPg}
            width="200px"
          />
        </Center>
      </Box>
    </Flex>
  );
};

interface BoxError {
  msg: string;
  h?: string;
}

export const BoxError = ({ msg, h }: BoxError) => {
  return (
    <Flex justify="center" direction="column" align="center" h={h ?? "100%"}>
      <BiErrorCircle color="#718096" size="26px" />
      <Text color="gray.500" mt="2" fontSize="sm">
        {msg}
      </Text>
    </Flex>
  );
};
