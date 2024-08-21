import { Box, Flex, Tag, Text } from "@chakra-ui/react";
import Link from "next/link";

const SearchTopic = ({ topic, subTopic }: any) => {
  return (
    <Box mt="4">
      <Box mb="4">
        <Text fontWeight="bold" fontSize={["xl", "xl", "2xl"]}>
          Topics
        </Text>
      </Box>
      <Box mb="8">
        <Flex wrap="wrap" gridGap="4">
          {topic && topic.length ? (
            topic.map((x: any) => (
              <Link
                key={x._id}
                href={{
                  pathname: "/Topics",
                  query: { id: x._id, tagType: "topic" },
                }}
                as={"/Topics"}
              >
                <Tag
                  fontWeight="bold"
                  color="gray.100"
                  borderRadius="full"
                  bg="gray.400"
                  cursor="pointer"
                >
                  {x.topic}
                </Tag>
              </Link>
            ))
          ) : (
            <Box>
              <Text color="poldit.100">No Topics found</Text>
            </Box>
          )}
        </Flex>
      </Box>
      <Box mb="4">
        <Text fontWeight="bold" fontSize={["xl", "xl", "2xl"]}>
          SubTopics
        </Text>
      </Box>
      <Box mb="8">
        <Flex wrap="wrap" gridGap="4">
          {subTopic && subTopic.length ? (
            subTopic.map((x: any) => (
              <Link
                href={{
                  pathname: "/Topics",
                  query: { id: x._id, tagType: "subTopic" },
                }}
                as={"/Topics"}
                key={x._id}
              >
                <Tag
                  fontWeight="bold"
                  color="gray.100"
                  borderRadius="full"
                  bg="gray.400"
                  cursor="pointer"
                  key={x._id}
                >
                  {x.subTopic}
                </Tag>
              </Link>
            ))
          ) : (
            <Box>
              <Text color="poldit.100">No Subtopics found</Text>
            </Box>
          )}
        </Flex>
      </Box>
    </Box>
  );
};
export default SearchTopic;
