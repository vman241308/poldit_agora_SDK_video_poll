import {
  Avatar,
  Box,
  Button,
  CloseButton,
  Flex,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { User } from "_components/appTypes/appType";
import TimeAgo from "react-timeago";
import RichTxtOut from "_components/pageComponents/Other/RichText/RichTxtOut";

interface IProps {
  question: string;
  creationDate: string;
  creator: User;
  close: () => void;
  isHost: boolean;
}

export const StaticContentHeader = ({
  question,
  creationDate,
  creator,
  close,
  isHost,
}: IProps) => {
  const [showCard, setShowCard] = useState<boolean>(false);
  const handleToggle = () => setShowCard(!showCard);
  return (
    <Stack overflow={"hidden"}>
      <Flex justifyContent={"space-between"} alignItems="center">
        <Flex>
          <Box position={"relative"}>
            <Avatar
              name={`${creator.firstname} ${creator.lastname}`}
              src={creator?.profilePic}
              border="none"
              cursor="pointer"
              bg="gray.500"
              color="white"
            />
          </Box>
          <Flex direction="column" justify="center" pl="4">
            <Text fontSize="xs" color="gray.500">
              by {creator?.appid}
            </Text>
            <Text fontSize="xs" color="gray.500">
              <TimeAgo date={creationDate} live={false} />
            </Text>
          </Flex>
          {/* <Button onClick={close}>Close</Button> */}
        </Flex>
        {isHost && (
          <CloseButton
            onClick={close}
            _hover={{ color: "poldit.100", border: "1px" }}
            _focus={{ outline: "none" }}
            color="gray.600"
            size={"sm"}
          />
        )}
      </Flex>
      <RichTxtOut
        contentType="video"
        content={question}
        fontSize={["xs", "sm", "sm", "sm"]}
        txtStyle={{ pl: "3", whiteSpace: "normal" }}
        show={showCard}
        cardToggle={handleToggle}
      />
    </Stack>
    // <Flex justify="space-between">
    //   <Flex>
    //     <Box position={"relative"}>
    //       <Avatar
    //         name={`${creator.firstname} ${creator.lastname}`}
    //         src={creator?.profilePic}
    //         border="none"
    //         cursor="pointer"
    //         bg="gray.500"
    //         color="white"
    //       />
    //     </Box>
    //     <Flex direction="column" justify="center" pl="4">
    //       <Text fontSize="xs" color="gray.500">
    //         by {creator?.appid}
    //       </Text>
    //       <Text fontSize="xs" color="gray.500">
    //         <TimeAgo date={creationDate} live={false} />
    //       </Text>
    //     </Flex>
    //   </Flex>
    // </Flex>
  );
};
