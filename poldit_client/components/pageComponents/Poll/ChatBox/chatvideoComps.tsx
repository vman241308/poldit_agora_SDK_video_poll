import {
  Avatar,
  Box,
  Flex,
  Grid,
  HStack,
  Link as ChakraLink,
  Tooltip,
  useDisclosure,
  GridItem,
  Stack,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Center,
  Square,
  InputGroup,
  Input,
  Button,
} from "@chakra-ui/react";
import Link from "next/link";
import TimeAgo from "react-timeago";
import { useState } from "react";
import { Answer, ChatMessage, User } from "_components/appTypes/appType";
import HCollapse from "_components/pageComponents/Other/Collapse/HCollapse";
import { ChatTabProps, OtherUserCardProps, ReplyMssgBox } from ".";
import ChatReactionBar from "./ChatReactBar";
import {
  AnswerReference_Static,
  MsgReference_Static,
  UserReference_Mssg,
} from "./chatRefs";
import PollChatSettings from "_components/pageComponents/Other/Settings/Chat";
import { ChatReactBar_Selected } from "_components/pageComponents/Poll/ChatBox/ChatReactBar";
import { StaticCardContent } from "../AnsBox";
import dynamic from "next/dynamic";
import { AppContextInterface } from "_components/authProvider/authType";
import { VideoViewProps } from "./chatVideo";
import { RiSendPlaneFill } from "react-icons/ri";

const UserRefBox = dynamic(() => import("./UserRefWindow"));

interface VideoChatMssg extends OtherUserCardProps {
  user: User;
  iconColor?: string;
}

interface ChatFooterProps {
  chatRef: ChatMessage | undefined;
  handleRef: (refType: string, refObj: ChatMessage | undefined) => void;
  answerRef: Answer | undefined;
  isUserRefOpen: boolean;
  chatUsers: User[];
  chatUsersLoading: boolean;
  tagUserHandler: (appid: string) => void;
  auth: AppContextInterface | null;
  chatInputHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (e: any, isAnswer?: boolean) => Promise<void>;
  userAnswer: string;
}

export const VideoChatMssg = (props: VideoChatMssg) => {
  const isUser = !props.user || props.user?._id !== props.data.creator._id;

  return (
    <Box my="3">
      {isUser ? (
        <Flex alignItems="flex-start" direction="column">
          <UserMssg {...props} />
          {/* <Box pl="18%">
            <ReactionBar {...props} />
          </Box> */}
        </Flex>
      ) : (
        <Flex alignItems="flex-end" direction="column">
          <MyMssg {...props} />
          <Box pr="10%">
            <ChatReactBar_Selected data={props.data} txtColor="white" />
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export const ChatFooter = (props: ChatFooterProps) => {
  return (
    <Box mt="1">
      {props.chatRef && (
        <ReplyMssgBox data={props.chatRef} reply={props.handleRef} />
      )}
      {props.answerRef && (
        <StaticCardContent data={props.answerRef} refAnswer={props.handleRef} />
      )}
      <form>
        <Flex py="1" px={2} position="relative">
          {props.isUserRefOpen && props.chatUsers?.length > 0 && (
            <UserRefBox
              data={props.chatUsers as User[]}
              loading={props.chatUsersLoading}
              select={props.tagUserHandler}
            />
          )}
          <InputGroup>
            <Input
              name="msg"
              type="text"
              color="white"
              borderRadius="6px 0 0 6px"
              placeholder="Type message here..."
              id="input_chat_mssg"
              disabled={!props.auth?.isLoggedIn}
              value={props.userAnswer}
              onChange={props.chatInputHandler}
              _focus={{ borderColor: "poldit.100" }}
            />
          </InputGroup>

          <Button
            ml="1"
            disabled={!props.auth?.isLoggedIn}
            bg="gray.700"
            id="submit_chat_mssg"
            borderRadius="0 6px 6px 0"
            _focus={{ outline: "none" }}
            _hover={{ bg: "gray.800" }}
            onClick={(e) => props.onSend(e, false)}
            type="submit"
            border="1px solid white"
          >
            <RiSendPlaneFill color="white" size="20px" />
          </Button>
        </Flex>
      </form>
    </Box>
  );
};

const MyMssg = (props: VideoChatMssg) => (
  <Flex justifyContent="flex-end" w="100%">
    <Box
      maxW="75%"
      minW="35%"
      bg="green.400"
      color="white"
      //   minW={props.data.ansRef && "60%"}
      boxShadow="0 0 32px rgb(0 0 0 / 8%), 0rem 16px 16px -16px rgb(0 0 0 / 10%);"
      borderRadius="18px 18px 18px 0"
      // borderRadius="18px 18px 0 18px"
      p={props.data.msgRef ? "2" : "0"}
    >
      {props.data.msgRef && <MsgReference_Static data={props.data} />}
      {props.data.ansRef && <AnswerReference_Static data={props.data} />}
      <UserReference_Mssg
        mssg={props.data.message}
        txtStyle={{
          color: "white",
          fontSize: "sm",
          pt: "2",
          pr: "2",
          // padding: "2",
          paddingLeft: "3",
          textAlign: "start",
        }}
      />
      <Text fontSize="xs" color="gray.200" p="2" textAlign={"end"}>
        <TimeAgo date={props.data.creationDate} live={false} />
      </Text>
    </Box>
    <Center>
      <PollChatSettings
        mssg={props.data}
        reply={props.handleRef}
        isMe={true}
        report={props.report}
        loggedIn={props.userId ? true : false}
        iconColor="white"
        txtColor="gray.500"
      />
    </Center>
  </Flex>
);

export const UserMssg = (props: VideoChatMssg) => (
  <>
    <Flex flexDir={"row"}  w="100%">
      <Box mt="2" ml="2">
        <UserAvatar data={props.data} size={"sm"} />
      </Box>
      <Flex direction={"column"} alignItems="flex-start" w="100%" ml="2">
        <HStack w="100%" spacing={0}>
          <Box
            bg="white"
            borderRadius="18px 18px 0px 18px"
            boxShadow="0 0 32px rgb(0 0 0 / 8%), 0rem 16px 16px -16px rgb(0 0 0 / 10%);"
            minW={props.data.ansRef ? "60%" : "35%"}
            maxW="80%"
            p={props.data.msgRef ? "2" : "0"}
          >
            {props.data.msgRef && <MsgReference_Static data={props.data} />}
            {props.data.ansRef && <AnswerReference_Static data={props.data} />}

            <UserReference_Mssg
              mssg={props.data.message}
              txtStyle={{
                color: "gray.700",
                fontSize: "sm",
                pt: "2",
                pl: "2",
                pr: "4",
                textAlign: "start",
              }}
            />
            <Text fontSize="xs" color="gray.400" p="2" textAlign={"end"}>
              <TimeAgo date={props.data.creationDate} live={false} />
            </Text>
          </Box>
          <Center>
            <PollChatSettings
              mssg={props.data}
              reply={props.handleRef}
              isMe={false}
              report={props.report}
              loggedIn={props.userId ? true : false}
              iconColor={props.iconColor ?? "white"}
              txtColor="gray.500"
            />
          </Center>
        </HStack>

        <Box>
          <ReactionBar
            data={props.data}
            handleRef={props.handleRef}
            report={props.report}
            userId={props.userId}
            handleScroll={props.handleScroll}
            txtColor="gray.500"
          />
        </Box>
      </Flex>
    </Flex>
  </>
);

export const ReactionBar = (props: OtherUserCardProps) => {
  const { getButtonProps, getDisclosureProps, isOpen, onClose } =
    useDisclosure();
  const [hidden, setHidden] = useState(!isOpen);

  return (
    <HCollapse
      style={{
        background: "none",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
      btnStyle={{ fontSize: "xs", color: "gray.300" }}
      hoverColor="blue.200"
      data={props.data}
      getButtonProps={getButtonProps}
      getDisclosureProps={getDisclosureProps}
      hidden={hidden}
      setHidden={setHidden}
      isOpen={isOpen}
      txtColor={props.txtColor ?? "white"}
    >
      <ChatReactionBar
        data={props.data}
        userId={props.userId}
        handleScroll={props.handleScroll}
        close={onClose}
      />
    </HCollapse>
  );
};

interface UserAvatarProps {
  data: any;
  size: string;
}

export const UserAvatar = (props: UserAvatarProps) => (
  <Link href={`/Profile/${props.data?.creator?.appid}`} passHref>
    <ChakraLink
      isExternal
      _hover={{ outline: "none", textDecoration: "none" }}
      _focus={{ outline: "none" }}
    >
      <Flex
        position="relative"
        // w="100%"
        alignItems={"center"}
        _hover={{ outline: "none" }}
        _focus={{ outline: "none" }}
      >
        <Tooltip
          label={props.data?.creator?.appid}
          hasArrow
          placement="top-start"
          rounded="md"
        >
          <Avatar
            name={`${props.data?.creator?.firstname} ${props.data?.creator?.lastname}`}
            src={props.data?.creator?.profilePic}
            size={props.size ?? "md"}
            cursor="pointer"
            bg="gray.500"
            border="none"
            color="white"
          />
        </Tooltip>
        {props.data.isActive && (
          <Tooltip
            label="Active"
            hasArrow
            placement="right-end"
            fontSize={"xs"}
          >
            <Box
              position="absolute"
              w="10px"
              h="10px"
              borderRadius="50%"
              bg="green.300"
              top="9"
              right="3px"
            ></Box>
          </Tooltip>
        )}
      </Flex>
    </ChakraLink>
  </Link>
);
