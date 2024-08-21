import { Box, Flex, Text } from "@chakra-ui/react";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import TimeAgo from "react-timeago";
import { IoIosReturnRight } from "react-icons/io";
import Link from "next/link";
import RichTxtOut from "../Other/RichText/RichTxtOut";
import { useState } from "react";

const SearchAns = ({ results }: any) => {
  if (!results || !results.length) {
    return null;
  }
  return (
    <Box mt="2" pb="8">
      {results.map((x: any) => (
        <Box
          key={x?._id}
          bg="white"
          overflow="hidden"
          boxShadow="0 1px 10px -1px rgba(0,0,0,.2)"
          borderRadius="lg"
          mb="8"
          p="6"
        >
          <Box pb="1" bg="white">
            <Flex justify="flex-start" align="center">
              <Text fontWeight="bold">{x.poll.creator.appid}</Text>
              <Text fontSize="xs" pl="2">
                <TimeAgo date={x?.creationDate} live={false} />
              </Text>
            </Flex>
            <PollQuestion_RichTxt data={x} />
          </Box>
          <Flex bg="white" align="flex-start" justify="center" mt="2">
            <Box mr="2" mt="1">
              <IoIosReturnRight />
            </Box>
            <Box w="100%">
              <PollAnswer_RichTxt data={x} />
              {/* <Box bg="gray.200" p="3" borderRadius="md">
                <Text fontWeight="bold" color="gray.700">
                  {x?.creator?.appid}
                </Text>
                <Text fontSize={["sm", "sm", "md"]} color="gray.700">
                  {x.answer}
                </Text>
              </Box> */}

              <Flex
                justifyContent="space-between"
                alignItems="center"
                mt="2"
                px="2"
              >
                <Flex justifyContent="flex-start" alignItems="center">
                  <Flex color="gray.400" align="flex-start" mr="4">
                    <FiThumbsUp size="18px" />
                    <Text color="gray.700" fontSize="sm" ml="1">
                      {x?.likes.length}
                    </Text>
                  </Flex>
                  <Flex color="gray.400" mr="1" align="center">
                    <FiThumbsDown size="18px" />
                    <Text color="gray.700" fontSize="sm" ml="1">
                      {x?.dislikes.length}
                    </Text>
                  </Flex>
                </Flex>
                <Box>
                  <Text color="gray.700" fontSize="sm">
                    Rank 2 of 7
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Flex>
        </Box>
      ))}
    </Box>
  );
};

export default SearchAns;

const PollQuestion_RichTxt = ({ data }: any) => {
  const [showCard, setShowCard] = useState<boolean>(false);

  const handleToggle = () => setShowCard(!showCard);

  return (
    <Box>
      {data?.poll?.question ? (
        <RichTxtOut
          contentType="Answer"
          content={data?.poll?.question}
          link={`/Polls/${data?.poll?._id}`}
          show={showCard}
          cardToggle={handleToggle}
        />
      ) : (
        <Text>Question not available</Text>
      )}
    </Box>
  );
};

const PollAnswer_RichTxt = ({ data }: any) => {
  const [showCard, setShowCard] = useState<boolean>(false);

  const handleToggle = () => setShowCard(!showCard);

  return (
    <Box bg="gray.200" p="3" borderRadius="md">
      <Text fontWeight="bold" color="gray.700">
        {data?.creator?.appid}
      </Text>
      <RichTxtOut
        contentType="Answer"
        content={data.answer}
        show={showCard}
        cardToggle={handleToggle}
      />
      {/* <Text fontSize={["sm", "sm", "md"]} color="gray.700">
        {data.answer}
      </Text> */}
    </Box>
  );
};
