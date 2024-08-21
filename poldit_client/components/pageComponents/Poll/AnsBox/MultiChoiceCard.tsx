import {
  Box,
  Text,
  Flex,
  Tooltip,
  Progress,
  Button,
  HStack,
  Icon,
  Tag,
} from "@chakra-ui/react";
import React from "react";
import { Answer } from "_components/appTypes/appType";
import { GoVerified } from "react-icons/go";

interface MultiChoiceCard {
  data: { _id: string; answerVal: string; rank: string; votes: number };
  answer: Answer;
  choose: (id: string, answerId: string) => void;
  myVote: string | undefined;
  loading: boolean;
  style?: any;
  isStatic?: boolean;
}

const MultiChoiceCard = ({
  data,
  answer,
  choose,
  myVote,
  loading,
  style,
  isStatic,
}: MultiChoiceCard) => {
  const votePct = answer?.multichoiceVotes
    ? Math.round((data.votes / answer.multichoiceVotes?.length) * 100)
    : 0;

  return (
    <Box
      cursor={!isStatic && "pointer"}
      position="relative"
      id="submit_multichoice_answer"
      onClick={() => !isStatic && !loading && choose(data._id, answer?._id)}
      {...style}
      // p="4"
      bg="white"
      rounded={"md"}
      boxShadow="0 5px 10px -1px rgba(0,0,0,.2)"
      _hover={{ border: !isStatic ? "1px solid #ff4d00" : "none" }}
    >
      <Box mx="5" position={"relative"} zIndex={10}>
        <Text
          fontSize="sm"
          fontWeight={"400"}
          color="gray.500"
          whiteSpace={"normal"}
        >
          {data?.answerVal}
        </Text>
      </Box>
      <Box
        position="absolute"
        top="0"
        left="0"
        bgGradient="linear(to-l, #fdc49b, #fdc49b)"
        boxShadow="0 3px -5px #fdc49b, 0 2px 5px #fdc49b"
        rounded="md"
        h="100%"
        w="0"
        opacity={0}
        style={{ opacity: 1, width: `${votePct}%`, transition: "1s ease 0.2s" }}
        zIndex={2}
      ></Box>

      <Flex justify="space-between" mx="5" pt="4">
        <HStack spacing="2" zIndex={10}>
          {data?._id === myVote && (
            <Tooltip label="Your vote" rounded="md">
              <Box>
                <Icon as={GoVerified} color="green.400" w={5} h={5} />
              </Box>
            </Tooltip>
          )}
          <Text fontSize="sm" color="gray.500">
            {data.votes === 1 ? `${data.votes} vote` : `${data.votes} votes`}
          </Text>
        </HStack>
        <Tag bg="gray.100" zIndex={10}>
          <Text fontSize="sm" color="gray.500">
            {data.rank}
          </Text>
        </Tag>
      </Flex>
    </Box>
  );
};

export default MultiChoiceCard;
