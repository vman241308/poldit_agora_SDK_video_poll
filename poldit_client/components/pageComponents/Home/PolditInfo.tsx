import { Heading, Stack, Text, Button, Center, HStack } from "@chakra-ui/react";
import Link from "next/link";

interface IPolditInfoProps {
  loggedIn: boolean;
}

const PolditInfo = ({ loggedIn }: IPolditInfoProps) => {
  return (
    <Stack
      spacing="4"
      bg="white"
      p="4"
      boxShadow="0 0 32px rgb(0 0 0 / 8%), 0rem 16px 16px -16px rgb(0 0 0 / 10%);"
      borderRadius="18px 0 18px 18px"
    >
      {/* <Text color="poldit.100" size="lg" 
      fontFamily={"malgunBody"}>
        Share Knowledge
      </Text> */}
      <Text fontSize={"md"} as={"i"} color="gray.500">
        Welcome to Poldit, the new information sharing platform fusing AI and
        community insights. A small startup, we want a better way to communicate
        and get in-depth knowledge through Q&A and soon live stream. Join the
        community and support our mission!
      </Text>
      <Center justifyContent={"space-around"}>
        <Link href="/About">
          <Button
            variant="outline"
            color="#ff4d00"
            borderColor="#ff4d00"
            _hover={{ bg: "#ff4d00", color: "white" }}
            _active={{ outline: "none" }}
            _focus={{ outline: "none", bg: "#ff4d00", color: "white" }}
            size="sm"
          >
            Learn More
          </Button>
        </Link>
        {!loggedIn && (
          <Link href="/Login">
            <Button
              variant="outline"
              color="#ff4d00"
              borderColor="#ff4d00"
              _hover={{ bg: "#ff4d00", color: "white" }}
              _active={{ outline: "none" }}
              _focus={{ outline: "none", bg: "#ff4d00", color: "white" }}
              size="sm"
            >
              Register/Log In
            </Button>
          </Link>
        )}
      </Center>
    </Stack>
  );
};

export default PolditInfo;

export const PolditInfo_Mobile = ({ loggedIn }: IPolditInfoProps) => {
  return (
    <Center>
      <Stack
        spacing="4"
        bg="white"
        p="4"
        w="96%"
        boxShadow="0 0 32px rgb(0 0 0 / 8%), 0rem 16px 16px -16px rgb(0 0 0 / 10%);"
        rounded="md"
      >
        {/* <Heading
          color="poldit.100"
          size="lg"
          as="h4"
          fontFamily={"malgunBody"}
          textAlign="center"
        >
          Share Knowledge
        </Heading> */}
        <Text fontSize={"md"} as={"i"} color="gray.500">
          Welcome to Poldit, the new information sharing platform fusing AI and
          community insights. A small startup, we want a better way to
          communicate and get in-depth knowledge through Q&A and soon live
          stream. Join the community and support our mission!
        </Text>
        <Center justifyContent={"space-around"}>
          <Link href="/About">
            <Button
              variant="outline"
              color="#ff4d00"
              w="40%"
              borderColor="#ff4d00"
              _hover={{ bg: "#ff4d00", color: "white" }}
              _active={{ outline: "none" }}
              _focus={{ outline: "none", bg: "#ff4d00", color: "white" }}
              size="sm"
            >
              Learn More
            </Button>
          </Link>
          {!loggedIn && (
            <Link href="/Login">
              <Button
                variant="outline"
                color="#ff4d00"
                w="40%"
                borderColor="#ff4d00"
                _hover={{ bg: "#ff4d00", color: "white" }}
                _active={{ outline: "none" }}
                _focus={{ outline: "none", bg: "#ff4d00", color: "white" }}
                size="sm"
              >
                Register/Log In
              </Button>
            </Link>
          )}
        </Center>
      </Stack>
    </Center>
  );
};
