import {
  Box,
  UnorderedList,
  ListItem,
  Tag,
  Text,
  Stack,
  Flex,
} from "@chakra-ui/react";
import { upcomingFeatureData } from "./data";

const upcomingFeatures = () => {
  return (
    <Stack spacing={"3"}>
      {upcomingFeatureData.map((item, idx) => (
        <Flex
          key={idx}
          p="5"
          cursor={"pointer"}
          bg="gray.200"
          flexDir={"column"}
        >
          <Text color="gray.500" fontSize={["md", "md", "lg"]} _hover={{ color: "gray.700" }}>
            {item}
          </Text>
        </Flex>
      ))}
    </Stack>
  );
};

export default upcomingFeatures;
