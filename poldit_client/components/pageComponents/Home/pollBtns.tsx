import { useQuery } from "@apollo/client";
import {
  Flex,
  Tag,
  Text,
  Stack,
  Box,
  HStack,
  Image,
  Center,
  Button,
} from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { IconType } from "react-icons/lib";
import { ITopic, PollHistory } from "_components/appTypes/appType";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import Scrollbars from "../Other/Scrollbar";
import { HandleTopic } from "./views";

interface PollBtns {
  data: PollHistory[];
  isMobile?: boolean;
  topic: string;
  handleTopic: HandleTopic;
  loading: boolean;
}

const PollWindow = ({
  data,
  isMobile,
  topic,
  handleTopic,
  loading,
}: PollBtns) => {
  const { data: topics, loading: topicLoading } = useQuery(
    GraphResolvers.queries.TOPICS_WITH_CONTENT,
    { variables: { limit: 5 } }
  );

  return (
    <Box>
      <Text
        textAlign={"center"}
        mb="3"
        fontSize={isMobile ? "md" : "lg"}
        fontWeight={"semibold"}
        color={"gray.500"}
      >
        Popular Topics
      </Text>
      {isMobile ? (
        <Scrollbars
          autoHeight
          autoHeightMin={100}
          autoHeightMax={200}
          style={{ overflowY: "auto" }}
        >
          <HStack spacing="3" mb="4">
            {topics?.topicsWithContent.map((x: ITopic) => (
              <TopicBtn
                key={x._id}
                isMobile={isMobile}
                topic={x}
                selectedTopic={topic}
                handleTopic={handleTopic}
                loading={loading}
              />
            ))}
            <Link
              href={{
                pathname: "/Topics",
                // query: { id: "All_1", tagType: "topic" },
              }}
              as={"/Topics"}
            >
              <Button
                variant={"unstyled"}
                rounded="md"
                fontWeight="normal"
                _focus={{ outline: "none" }}
                _hover={{ outline: "none", fontWeight: "semibold" }}
                color="blue.500"
                fontSize="sm"
                w="100%"
                minW="150px"
              >
                See All Topics
              </Button>
            </Link>
          </HStack>
        </Scrollbars>
      ) : (
        <Stack spacing="3">
          {topics?.topicsWithContent.map((x: ITopic) => (
            <TopicBtn
              topic={x}
              isMobile={isMobile ?? false}
              key={x._id}
              selectedTopic={topic}
              handleTopic={handleTopic}
              loading={loading}
            />
          ))}
          <Link
            href={{
              pathname: "/Topics",
              // query: { id: "All_1", tagType: "topic" },
            }}
            as={"/Topics"}
          >
            <Text
              fontSize="sm"
              cursor="pointer"
              color="blue.500"
              textAlign={"center"}
              mt="2"
              _hover={{
                fontWeight: "semibold",
                cursor: "pointer",
              }}
            >
              See All Topics
            </Text>
          </Link>
        </Stack>
      )}

      {/* <HStack spacing="3">
        {topics?.topicsWithContent.map((x: ITopic) => (
          <TopicBtn
            key={x._id}
            topic={x}
            selectedTopic={topic}
            handleTopic={handleTopic}
          />
        ))}
      </HStack> */}
    </Box>
  );

  // return (
  //   <Box bg="white" p="3" rounded="md" boxShadow="md">
  //     <Text
  //       textAlign={"center"}
  //       mb="5"
  //       fontSize={isMobile ? "md" : "lg"}
  //       fontWeight={"semibold"}
  //       color={"gray.500"}
  //     >
  //       Popular Topics
  //     </Text>
  //     {isMobile ? (
  //       <Scrollbars
  //         autoHeight
  //         autoHeightMin={100}
  //         autoHeightMax={200}
  //         style={{ overflowY: "auto" }}
  //       >
  //         <HStack spacing="3" mb="4">
  //           {topics?.topicsWithContent.map((x: ITopic) => (
  //             <TopicTag
  //               topic={x}
  //               key={x._id}
  //               selectedTopic={topic}
  //               handleTopic={handleTopic}
  //             />
  //           ))}
  //         </HStack>
  //       </Scrollbars>
  //     ) : (
  //       <Stack spacing="3" alignItems={"center"}>
  //         {topics?.topicsWithContent.map((x: ITopic) => (
  //           <TopicTag
  //             topic={x}
  //             key={x._id}
  //             selectedTopic={topic}
  //             handleTopic={handleTopic}
  //           />
  //         ))}
  //       </Stack>
  //     )}
  //     <Link href="/Topics">
  //       <Text
  //         fontSize="sm"
  //         cursor="pointer"
  //         color="blue.500"
  //         textAlign={"center"}
  //         mt="2"
  //         _hover={{
  //           fontWeight: "semibold",
  //           cursor: "pointer",
  //         }}
  //       >
  //         See All Topics
  //       </Text>
  //     </Link>
  //   </Box>
  // );
};

export default PollWindow;

interface TopicTag {
  topic: ITopic;
  // Icon: IconType;
  selectedTopic: string;
  handleTopic: HandleTopic;
  isMobile: boolean;
  loading: boolean;
}

const TopicBtn = ({
  topic,
  // Icon,
  selectedTopic,
  handleTopic,
  isMobile,
  loading,
}: TopicTag) => (
  <Button
    p="4"
    // leftIcon={<Icon />}
    rounded="md"
    _focus={{ outline: "none" }}
    _hover={{ outline: "none", bg: "gray.300" }}
    bg={topic._id === selectedTopic ? "gray.500" : "white"}
    color={topic._id === selectedTopic ? "white" : "gray.600"}
    fontSize={isMobile ? "xs" : "sm"}
    boxShadow="md"
    w="100%"
    minW="150px"
    borderColor="gray.400"
    isLoading={loading && topic._id === selectedTopic}
    loadingText="Loading"
    onClick={() => handleTopic(topic._id)}
  >
    {topic.topic}
  </Button>
);

const TopicTag = ({ topic, selectedTopic, handleTopic }: TopicTag) => {
  return (
    <Box
      rounded={"md"}
      position={"relative"}
      style={
        topic._id === selectedTopic
          ? { border: "3px solid #ff4d00" }
          : { border: "1px" }
      }
      backgroundImage={topic.image}
      backgroundPosition="center"
      bgSize={"cover"}
      bgRepeat="no-repeat"
      height="80px"
      w="100%"
      minW="150px"
      boxShadow="md"
      borderColor="gray.400"
      cursor={"pointer"}
      onClick={() => handleTopic(topic._id)}
    >
      <Flex
        position={"absolute"}
        w="100%"
        h="100%"
        alignItems={"center"}
        justify={"center"}
        flexDir="column"
      >
        <Text
          fontWeight={"semibold"}
          color={"white"}
          fontSize="sm"
          bg="poldit.100"
          p="1"
          pl="2"
          pr="2"
          rounded="md"
        >
          {`${topic.topic} ${topic.numPolls}`}
        </Text>
      </Flex>
    </Box>
  );
};
