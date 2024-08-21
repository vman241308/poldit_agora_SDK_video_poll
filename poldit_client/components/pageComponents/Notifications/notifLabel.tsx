import { Text, Box, Spacer } from "@chakra-ui/react";
import { UserNotification } from "_components/appTypes/appType";
import { CustomEditor } from "_pageComponents/Editor/functions";

export const getNotifLabel = (notif: UserNotification) => {
  let pollQuestion = notif.parentCollectionId?.question;
  if (pollQuestion?.startsWith('[{"type":')) {
    pollQuestion =
      CustomEditor.getPlainText(
        JSON.parse(notif.parentCollectionId?.question as string)
      )
        .join("")
        .slice(0, 80) + "...";
  }

  switch (true) {
    case notif.message.search("A new poll was created") > -1:
      return (
        <Box
          fontSize="sm"
          cursor="pointer"
          _hover={{ color: "blue.400" }}
          mb="2"
        >
          <Text mb="2">{notif.message}</Text>
          <Spacer />
          <Text>{pollQuestion}</Text>
        </Box>
      );

    case notif.message.search(
      "how the answer selection changed the current answer rankings"
    ) > -1:
      return (
        <Box
          fontSize="sm"
          cursor="pointer"
          _hover={{ color: "blue.400" }}
          mb="2"
        >
          <Text mb="2">
            {`${notif.creator.appid} selected a multiple choice answer on your poll`}
            :
          </Text>
          <Spacer />
          <Text>{pollQuestion}</Text>
        </Box>
      );

    case notif.message.search(
      "Go to the poll to see the current answer rankings"
    ) > -1:
      return (
        <Box
          fontSize="sm"
          cursor="pointer"
          _hover={{ color: "blue.400" }}
          mb="2"
        >
          <Text mb="2">
            {`${notif.creator.appid} reacted to your answer on poll`}:
          </Text>
          <Spacer />
          <Text>{pollQuestion}</Text>
        </Box>
      );

    case notif.message.search("Go to the poll to see") > -1:
      return (
        <Box
          fontSize="sm"
          cursor="pointer"
          _hover={{ color: "blue.400" }}
          mb="2"
        >
          <Text mb="2">
            {`${notif.creator.appid} added an answer to your poll`}:
          </Text>
          <Spacer />
          <Text>{pollQuestion}</Text>
        </Box>
      );
    case notif.message.search("Go to the poll to see") > -1:
      return (
        <Box
          fontSize="sm"
          cursor="pointer"
          _hover={{ color: "blue.400" }}
          mb="2"
        >
          <Text mb="2">
            {`${notif.creator.appid} added an answer to your poll`}:
          </Text>
          <Spacer />
          <Text>{pollQuestion}</Text>
        </Box>
      );

    case notif.message.search("started a conversation") > -1:
      return (
        <Box
          fontSize="sm"
          cursor="pointer"
          _hover={{ color: "blue.400" }}
          mb="2"
        >
          <Text mb="2">{notif.message.split(".")[0]}:</Text>
          <Spacer />
          <Text>{pollQuestion}</Text>
        </Box>
      );
    case notif.message.search("referenced one of your answers") > -1:
      return (
        <Box
          fontSize="sm"
          cursor="pointer"
          _hover={{ color: "blue.400" }}
          mb="2"
        >
          <Text mb="2">{notif.message.split(".")[0]}:</Text>
          <Spacer />
          <Text>{pollQuestion}</Text>
        </Box>
      );
    case notif.message.search("mentioned you in a discussion") > -1:
      return (
        <Box
          fontSize="sm"
          cursor="pointer"
          _hover={{ color: "blue.400" }}
          mb="2"
        >
          <Text mb="2">{notif.message.split(".")[0]} for poll:</Text>
          <Spacer />
          <Text>{pollQuestion}</Text>
        </Box>
      );
    case notif.message.search("replied to one of your chat messages") > -1:
      return (
        <Box
          fontSize="sm"
          cursor="pointer"
          _hover={{ color: "blue.400" }}
          mb="2"
        >
          <Text mb="2">{notif.message.split(".")[0]}:</Text>
          <Spacer />
          <Text>{pollQuestion}</Text>
        </Box>
      );

    case notif.message.search("People are chatting") > -1:
      return (
        <Box
          fontSize="sm"
          cursor="pointer"
          _hover={{ color: "blue.400" }}
          mb="2"
        >
          <Text mb="2">{notif.message}:</Text>
          <Spacer />
          <Text>{pollQuestion}</Text>
        </Box>
      );

    default:
      return (
        <Text
          fontSize="sm"
          cursor="pointer"
          _hover={{ color: "blue.400" }}
          mb="2"
        >
          {notif.message}
        </Text>
      );
  }
};
