import { Box, Flex, HStack, IconButton, Text } from "@chakra-ui/react";
import { ChatMessage } from "_components/appTypes/appType";
import TimeAgo from "react-timeago";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import Link from "next/link";
import { convertFromRaw, RawDraftContentState } from "draft-js";
import { CustomEditor } from "_components/pageComponents/Editor/functions";

export const MsgReference_Static = ({ data }: { data: ChatMessage }) => (
  <Box bg={"gray.200"} rounded="md" p="2" m="1">
    <Text color="poldit.100" fontWeight={"semibold"} noOfLines={2}>
      {data?.msgRef?.creator.appid}
    </Text>
    <Text pt="2" pb="2" fontSize="xs" color={"gray.600"}>
      {data?.msgRef?.message}
    </Text>
    <Text fontSize="xs" color="gray.500" mr="2" mt="1">
      <TimeAgo date={data?.msgRef?.creationDate as string} live={false} />
    </Text>
  </Box>
);

export const AnswerReference_Static = ({ data }: { data: ChatMessage }) => {
  let answerVal = "";

  if (!data.ansRef?.isDisabled) {
    if (data?.ansRef?.answer.startsWith('[{"type":')) {
      answerVal = CustomEditor.getPlainText(
        JSON.parse(data?.ansRef?.answer)
      ).join("/n");
    } else if ((data?.ansRef?.answer as string).search('"blocks":') > -1) {
      const questionRawContent: RawDraftContentState = JSON.parse(
        data?.ansRef?.answer as string
      );
      const questionContent = convertFromRaw(questionRawContent);
      answerVal = questionContent.getPlainText();
    } else answerVal = data?.ansRef?.answer as string;
  } else answerVal = "This content was removed due to policy violations.";

  return (
    <Box bg="gray.200" fontSize="xs" rounded="lg" m="3" p="2">
      <Flex
        justifyContent="space-between"
        borderBottom="1px"
        borderColor="#d2d2d7"
        p="2"
      >
        <Text color="gray.500">{data?.ansRef?.creator?.appid}</Text>
        <Text color="gray.500">
          <TimeAgo date={data?.ansRef?.creationDate as string} live={false} />
        </Text>
      </Flex>

      <Box p="2">
        <Text
          noOfLines={2}
          color={data.ansRef?.isDisabled ? "red.400" : "gray.500"}
        >
          {answerVal}
        </Text>
      </Box>

      <Flex justifyContent="space-between" alignItems="center">
        <Flex justifyContent="flex-start" alignItems="center">
          <Flex justifyContent="center" alignItems="center" mr={3}>
            <IconButton
              icon={<FiThumbsUp size="18px" />}
              aria-label="thumbsup"
              variant="ghost"
              _focus={{ outline: "none" }}
              size="sm"
              color="green.300"
              disabled
            />
            {data?.ansRef?.numLikes && (
              <Box>
                <Text color="gray.700">{data?.ansRef?.numLikes}</Text>
              </Box>
            )}
          </Flex>

          <Flex justifyContent="center" alignItems="center">
            <IconButton
              icon={<FiThumbsDown size="18px" />}
              aria-label="thumbsup"
              variant="ghost"
              _focus={{ outline: "none" }}
              size="sm"
              color="red.300"
              mt={1}
              disabled
            />
            {data?.ansRef?.numDisLikes && (
              <Box>
                <Text color="gray.700">{data?.ansRef?.numDisLikes}</Text>
              </Box>
            )}
          </Flex>
        </Flex>
        {data?.ansRef?.rank && (
          <Box mr="4">
            <Text color="gray.700">
              {data?.ansRef?.rank === "Not Ranked"
                ? data.ansRef.rank
                : `Rank ${data?.ansRef?.rank}`}
            </Text>
          </Box>
        )}
      </Flex>
    </Box>
  );

  // return (
  //   <Box
  //     bg="gray.200"
  //     fontSize="xs"
  //     m="3"
  //     // minW={"60%"}
  //     w="full"
  //     // my="4"
  //     // py="4"
  //     // m="2"
  //     rounded="lg"
  //     boxShadow="0 0 32px rgb(0 0 0 / 8%), 0rem 16px 16px -16px rgb(0 0 0 / 10%);"
  //   >
  //     <Flex w="100%" pl="3" pr="1">
  //       <Flex
  //         w="100%"
  //         justifyContent="space-between"
  //         px={1}
  //         pb={1}
  //         borderBottom="1px"
  //         borderColor="#d2d2d7"
  //         mt="2px"
  //       >
  //         <Text color="gray.700">{data?.ansRef?.creator?.appid}</Text>

  //         <Text color="gray.700">
  //           <TimeAgo date={data?.ansRef?.creationDate as string} live={false} />
  //         </Text>
  //       </Flex>
  //     </Flex>

  //     <Box pt={5} pb={2} px={5}>
  //       <Text
  //         noOfLines={2}
  //         color={data.ansRef?.isDisabled ? "red.400" : "gray.500"}
  //       >
  //         {answerVal}
  //       </Text>
  //     </Box>

  //     <Flex justifyContent="space-between" alignItems="center" px="3">
  //       <Flex justifyContent="flex-start" alignItems="center">
  //         <Flex justifyContent="center" alignItems="center" mr={3}>
  //           <IconButton
  //             icon={<FiThumbsUp size="18px" />}
  //             aria-label="thumbsup"
  //             variant="ghost"
  //             _focus={{ outline: "none" }}
  //             size="sm"
  //             color="green.300"
  //             disabled
  //           />
  //           {data?.ansRef?.numLikes && (
  //             <Box>
  //               <Text color="gray.700">{data?.ansRef?.numLikes}</Text>
  //             </Box>
  //           )}
  //         </Flex>

  //         <Flex justifyContent="center" alignItems="center">
  //           <IconButton
  //             icon={<FiThumbsDown size="18px" />}
  //             aria-label="thumbsup"
  //             variant="ghost"
  //             _focus={{ outline: "none" }}
  //             size="sm"
  //             color="red.300"
  //             mt={1}
  //             disabled
  //           />
  //           {data?.ansRef?.numDisLikes && (
  //             <Box>
  //               <Text color="gray.700">{data?.ansRef?.numDisLikes}</Text>
  //             </Box>
  //           )}
  //         </Flex>
  //       </Flex>
  //       {data?.ansRef?.rank && (
  //         <Box mr="4">
  //           <Text color="gray.700">
  //             {data?.ansRef?.rank === "Not Ranked"
  //               ? data.ansRef.rank
  //               : `Rank ${data?.ansRef?.rank}`}
  //           </Text>
  //         </Box>
  //       )}
  //     </Flex>
  //   </Box>
  // );
};

interface UserRefMssg {
  mssg: string;
  txtStyle?: any;
}

export const UserReference_Mssg = ({ mssg, txtStyle }: UserRefMssg) => {
  let chatMssg: any = "";
  if (mssg.startsWith("@")) {
    const appid = mssg.split(" ")[0].slice(1);
    chatMssg = (
      <span>
        <a href={`/Profile/${appid}`} style={{ color: "#ff4d00" }}>
          {`${mssg.split(" ")[0]}`}
        </a>
        &nbsp;&nbsp;
        {`${mssg.split(" ").slice(1).join(" ")}`}
      </span>
    );
  } else {
    chatMssg = mssg;
  }

  return (
    <Text {...txtStyle} whiteSpace="normal">
      {/* // <Text color={color} fontSize="sm" p={padding ?? "4"} pl="2" textAlign="start"> */}
      {chatMssg}
    </Text>
  );
};
