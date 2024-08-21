import {
  Box,
  Flex,
  Text,
  HStack,
  Grid,
  GridItem,
  Heading,
  Stack,
} from "@chakra-ui/layout";
import { Button, Center, Collapse, Icon } from "@chakra-ui/react";
import { useState } from "react";
import CurrentFeaturesDetail from "./currentFeatures";
import { pillarData } from "./data";
import UpcomingFeaturesDetail from "./upcomingFeatures";

export const BrandedBanner = () => {
  return (
    <Flex
      w="100%"
      justifyContent={"space-between"}
      h="300px"
      alignItems={"center"}
    >
      {["Ask", "Answer", "Rank", "Discuss"].map((x, idx) => (
        <Box
          key={idx}
          bg="poldit.100"
          p="5"
          rounded={"md"}
          pl="8"
          textAlign={"center"}
        >
          <Text
            color="white"
            fontSize={{ sm: "lg", md: "3xl", lg: "5xl" }}
            fontFamily={"malgunBody"}
          >
            {x}
          </Text>
        </Box>
      ))}
    </Flex>
  );
};

export const PolditStack = () => {
  return (
    <Stack spacing="5" w="100%">
      {pillarData.map((item, idx) => (
        <Box
          key={idx}
          bg="white"
          rounded={"md"}
          display="flex"
          flexDirection={"column"}
          alignItems="center"
          justifyContent={"center"}
          p="5"
          boxShadow="0 1px 10px -1px rgba(0,0,0,.2)"
        >
          <HStack p="2" spacing="3">
            <Heading color="poldit.100" size={"lg"} textAlign={"center"}>
              {item.action.toUpperCase()}
            </Heading>
            <Box>
              <Icon as={item.icon} w="5" h="5" color="poldit.100" />
            </Box>
          </HStack>
          <PolditStackItem item={item} />
          {/* <Box flex="1" p="2">
            <Text
              color="gray.400"
              textAlign={"center"}
              fontSize={{ base: "xs", sm: "sm", md: "md", lg: "md" }}
            >
              {item.description}
            </Text>
          </Box> */}
        </Box>
      ))}
    </Stack>
  );
};

const PolditStackItem = ({ item }: any) => {
  const [show, setShow] = useState(false);

  return (
    <Box flex="1" p="2" w="100%">
      <Collapse in={show} startingHeight={16}>
        <Text
          color="gray.400"
          noOfLines={show ? 0 : 1}
          textAlign={"center"}
          fontSize={{ base: "xs", sm: "sm", md: "md", lg: "md" }}
        >
          {item.description}
        </Text>
      </Collapse>
      <Center>
        <Button
          size="sm"
          variant={"outline"}
          border="1px"
          color="poldit.100"
          borderColor={"poldit.100"}
          onClick={() => setShow(!show)}
          _hover={{bg: "none"}}
          mt="1rem"
          _focus={{ outline: "none" }}
        >
          Show {show ? "Less" : "More"}
        </Button>
      </Center>
    </Box>
  );
};

export const PolditPillars = () => {
  return (
    <Grid templateColumns="repeat(2, 2fr)" gap={5}>
      {pillarData.map((item, idx) => (
        <GridItem
          key={idx}
          bg="white"
          rounded={"md"}
          display="flex"
          flexDirection={"column"}
          alignItems="center"
          justifyContent={"center"}
          p="5"
          boxShadow="0 1px 10px -1px rgba(0,0,0,.2)"
        >
          <HStack p="2" spacing="3">
            <Heading color="poldit.100" size={"lg"} textAlign={"center"}>
              {item.action.toUpperCase()}
            </Heading>
            <Box>
              <Icon as={item.icon} w="5" h="5" color="poldit.100" />
            </Box>
          </HStack>

          <Box flex="1" p="2">
            <Text
              color="gray.400"
              mt="5"
              textAlign={"center"}
              fontSize={{ base: "xs", sm: "sm", md: "md", lg: "md" }}
            >
              {item.description}
            </Text>
          </Box>
        </GridItem>
      ))}
    </Grid>
  );
};

export const CurrentFeatures = () => {
  return (
    <Flex border="1px" borderColor="gray.400">
      <Flex
        w="35%"
        borderRight="1px"
        borderColor="gray.400"
        direction={"column"}
      >
        <Text
          fontWeight={"semibold"}
          color="gray.500"
          fontSize={"large"}
          pl="1"
        >
          Version
        </Text>
        <Button ml="2" mr="2" mt="2" bg="poldit.100" color="white">
          1.0
        </Button>
      </Flex>
      <CurrentFeaturesDetail />
    </Flex>
  );
};

export const UpcomingFeatures = () => {
  const [content, setContent] = useState("");

  const fetchData = async () => {
    try {
      const data = await (
        await fetch(
          "https://res.cloudinary.com/poldit/raw/upload/v1652474016/PoldIt/Docs/About_Us_04.14.22_Clean_-_Upcoming_Features_jtaf9j.docx"
        )
      ).text();

      setContent(data);
    } catch (err) {
      setContent("Upcoming Features unable to load.  Please try again later.");
    }
  };

  return (
    <Flex border="1px" borderColor="gray.400">
      <UpcomingFeaturesDetail />
    </Flex>
  );
};
