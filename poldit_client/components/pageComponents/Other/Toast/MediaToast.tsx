import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { IUserPresence } from "_components/hooks/channel/useChannel";
import { UserAvatar } from "_components/pageComponents/Poll/ChatBox/chatvideoComps";

interface Props {
  msg: string;
  data: { creator: IUserPresence };
}

function MediaToast({ msg, data }: Props) {
  return (
    <Flex
      bg="white"
      p="5"
      boxShadow="0 1px 10px -1px rgba(0,0,0,.2)"
      rounded="md"
      alignItems={"center"}
    >
      <Box>
        <UserAvatar data={{ creator: data.creator }} size="sm" />
      </Box>
      <Box flex="1" ml="2">
        <Text fontWeight="semibold" color="gray.600" whiteSpace="normal">
          {msg}
        </Text>
      </Box>
    </Flex>
  );
}

export default MediaToast;
