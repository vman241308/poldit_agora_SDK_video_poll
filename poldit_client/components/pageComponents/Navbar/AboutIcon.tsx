import { IconButton, Text, Tooltip, Box } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";

const AboutIcon = () => {
  const router = useRouter();

  return (
    <>
      <Tooltip
        label="Learn more about Poldit"
        hasArrow
        placement="bottom"
        rounded={"md"}
        width="100px"
      >
        <IconButton
          aria-label="about-us"
          variant="outline"
          color="#ff4d00"
          boxSize={"38px"}
          borderColor="#ff4d00"
          onClick={() => router.push("/About")}
          rounded={"full"}
          _hover={{ bg: "#ff4d00", color: "white" }}
          _active={{ outline: "none" }}
          _focus={{ outline: "none" }}
        >
          <Text fontFamily={"malgunBody"} fontSize="xl">
            A
          </Text>
        </IconButton>
      </Tooltip>
    </>
  );
};

export default AboutIcon;
