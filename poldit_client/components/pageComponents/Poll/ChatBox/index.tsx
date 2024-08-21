import {
  Avatar,
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  Spinner,
  Text,
  Tooltip,
  useToast,
  CloseButton,
  Stack,
  HStack,
  Link as ChakraLink,
  Grid,
  GridItem,
  Spacer,
  useDisclosure,
  Center,
} from "@chakra-ui/react";
import { RiSendPlaneFill } from "react-icons/ri";
import React, { useEffect, useRef, useState, forwardRef } from "react";
import { Scrollbars } from "react-custom-scrollbars-2";
import TimeAgo from "react-timeago";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";
import { ApolloError, useMutation, useQuery } from "@apollo/client";
// import { addNewChatMssg } from "../../../../lib/apollo/apolloFunctions/mutations";
import { BiErrorCircle } from "react-icons/bi";
import Link from "next/link";
import {
  Answer,
  ChatFeed,
  ChatMessage,
  SelectedImage,
  SubscribeToMore,
  User,
} from "_components/appTypes/appType";
import { AddAnswer, StaticCardContent } from "../AnsBox";
import {
  AnswerReference_Static,
  MsgReference_Static,
  UserReference_Mssg,
} from "./chatRefs";
import dynamic from "next/dynamic";
import PollChatSettings from "_components/pageComponents/Other/Settings/Chat";
import { getAuthId } from "_components/authProvider";
import { useAuth } from "_components/authProvider/authProvider";
import ChatReactionBar, { ChatReactBar_Selected } from "./ChatReactBar";
import HCollapse from "_components/pageComponents/Other/Collapse/HCollapse";
import VideoView from "./chatVideo";
import { ReactionBar, UserMssg } from "./chatvideoComps";
import { TPublishToChannel } from "_components/hooks/channel/useChannel";
// import Scrollbars from "_components/pageComponents/Other/Scrollbar";

const UserRefBox = dynamic(() => import("./UserRefWindow"));

export interface ChatTabProps {
  pollId: string;
  user: User;
  addAnswer: AddAnswer;
  answerRef: Answer | undefined;
  chatRef: ChatMessage | undefined;
  handleRef: (refType: string, refObj: ChatMessage | undefined) => void;
  report: (contentId: string, contentType: string, creator: string) => void;
  data: ChatFeed;
  loading: Boolean;
  error: ApolloError | undefined;
  subscribeToMore: SubscribeToMore;
  fetchMore: any;
  videoView?: boolean;
  publishToChannel?: TPublishToChannel;
}

const ChatTab = (props: ChatTabProps) => {
  const {
    pollId,
    user,
    addAnswer,
    answerRef,
    chatRef,
    handleRef,
    report,
    data,
    loading,
    error,
    subscribeToMore,
    fetchMore,
    videoView,
    publishToChannel,
  } = props;

  const scrollRef = useRef();
  const auth = useAuth();
  const [isBottom, setIsBottom] = useState(true);
  const toast = useToast();
  const userId = getAuthId();
  const [userAnswer, setUserAnswer] = useState("");
  const [isUserRefOpen, toggleUserRefOpen] = useState(false);
  const [chatUsers, setChatUsers] = useState<User[]>([]);
  const [taggedChatUser, setTaggedChatUser] = useState("");
  const [lockScroll, setLockScroll] = useState(false);
  // const [replyMssg, setReplyMssg] = useState<ChatMessage>();

  // const { loading, error, data, subscribeToMore, fetchMore } = useQuery(
  //   GraphResolvers.queries.GET_POLL_CHAT_PAGES,
  //   {
  //     variables: { cursor: "", pollId, limit: 10 },
  //     notifyOnNetworkStatusChange: true,
  //   }
  // );

  const { data: chatUsersData, loading: chatUsersLoading } = useQuery(
    GraphResolvers.queries.GET_ALL_POLL_CHAT_USERS,
    {
      variables: { pollId },
      onCompleted: (res) => setChatUsers(res.allPollChatUsers),
    }
  );

  const scrollToBottom = () => {
    if (scrollRef && scrollRef.current) {
      (scrollRef.current as any).scrollToBottom();
    }
  };

  const handleScrollLock = (scrollVal: boolean) => setLockScroll(scrollVal);

  const chatInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chatVal = e.target.value;
    if (
      chatVal.startsWith("@") &&
      chatUsersData?.allPollChatUsers?.length > 0
    ) {
      const trueChatVal = chatVal.slice(1);
      toggleUserRefOpen(true);
      const filteredUsers: User[] = chatUsersData.allPollChatUsers.filter(
        (x: User) => x.appid.toLowerCase().includes(trueChatVal.toLowerCase())
      );
      setChatUsers(filteredUsers);
    } else {
      toggleUserRefOpen(false);
      setChatUsers(chatUsersData.allPollChatUsers);
    }
    setUserAnswer(e.target.value);
  };

  useEffect(() => {
    subscribeToMore({
      document: GraphResolvers.subscriptions.CHAT_SUBSCRIPTION,
      variables: { pollId },
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData) return prev;
        const newChatItem = subscriptionData.data.newMessage;

        if (newChatItem.poll._id === pollId) {
          return Object.assign({}, prev, {
            messageFeedByPoll: {
              ...prev.messageFeedByPoll,
              messages: [
                ...prev.messageFeedByPoll.messages,
                { ...newChatItem, isActive: true },
              ],
            },
          });
        }

        return prev;
      },
    });
  }, []);

  const [addChatMssg] = useMutation(
    GraphResolvers.mutations.CREATE_CHAT_MESSAGE,
    {
      onCompleted: (res) => {
        props.publishToChannel &&
          props.publishToChannel("Chat Message", {
            uid: props.user._id,
            appid: props.user.appid,
            profilePic: props.user.profilePic,
            firstname: props.user.firstname,
            lastname: props.user.lastname,
            isMod: false,
            onPanel: false,
            pollStarted: false,
          });
      },
      onError: (e) => {
        toast({
          title: "Message Sending Failed",
          status: "error",
          isClosable: true,
          duration: 3000,
          position: "bottom-right",
          description: `${e.message}`,
        });
      },
    }
  );

  const tagUserHandler = (appid: string) => {
    setTaggedChatUser(appid);
    setUserAnswer(`@${appid}`);
    toggleUserRefOpen(false);
  };

  const onSend = async (e: any, isAnswer: boolean = false) => {
    e.preventDefault();
    //If isAnswer is true, use Add New Answer mutation along with chat message mutation so it updates the Answer Window above.  Client way is easier than backend way which is repetitive code
    if (!userAnswer) {
      return;
    }

    // let finalMssg = "";
    // if (userAnswer.startsWith("@")) {
    //   finalMssg = userAnswer.split(" ").slice(1).join(" ");
    // } else finalMssg = userAnswer;

    const details = JSON.stringify({
      message: userAnswer,
      poll: pollId,
      isAnswer,
      isActive: true,
      msgRef: chatRef && chatRef._id,
      ansRef: answerRef && answerRef._id,
      mentionRef: taggedChatUser && taggedChatUser,
    });

    await addChatMssg({ variables: { details } });

    // addNewChatMssg(addChatMssg, details, pollId);
    if (isAnswer && addAnswer) {
      await addAnswer(userAnswer, "");
    }
    setUserAnswer("");
    setIsBottom(true);
    handleRef("", undefined);
  };

  useEffect(() => {
    !lockScroll && isBottom && scrollToBottom();
  }, [window, data, lockScroll]);

  // const updateQuery = (previousResult: any, { fetchMoreResult }: any) => {
  //   if (!fetchMoreResult) return previousResult;
  //   return {
  //     messageFeedByPoll: {
  //       ...previousResult.messageFeedByPoll,
  //       cursor: fetchMoreResult.messageFeedByPoll.cursor,
  //       hasMoreData: fetchMoreResult.messageFeedByPoll.hasMoreData,
  //       messages: [
  //         ...fetchMoreResult.messageFeedByPoll.messages,
  //         ...previousResult.messageFeedByPoll.messages,
  //       ],
  //     },
  //   };
  // };
  const onScrollHandler = (e: any) => {
    if (e.target.scrollTop === 0) {
      if (data?.hasMoreData) {
        // if (data?.messageFeedByPoll?.hasMoreData) {
        setIsBottom(false);
        fetchMore({
          variables: {
            cursor: data?.cursor,
            // cursor: data?.messageFeedByPoll.cursor,
          },
          // updateQuery: updateQuery,
        });
      }
    }
    return;
  };

  const getChatBoxHeight = () => {
    let chatHeight = 650;
    if (chatRef) {
      chatHeight = 580;
    }

    if (answerRef) {
      chatHeight = 455;
    }

    return chatHeight;
  };

  if (videoView) {
    return (
      <VideoView
        {...props}
        scrollRef={scrollRef}
        onScrollHandler={onScrollHandler}
        userId={userId}
        handleScrollLock={handleScrollLock}
        isUserRefOpen={isUserRefOpen}
        chatUsers={chatUsers}
        chatUsersLoading={chatUsersLoading}
        tagUserHandler={tagUserHandler}
        auth={auth}
        userAnswer={userAnswer}
        chatInputHandler={chatInputHandler}
        onSend={onSend}
      />
    );
  }

  return (
    <Flex h="100%" flexDir={"column"} justifyContent="space-between">
      <Box
        mt="4"
        ml="3"
        mr="3"
        h={`${getChatBoxHeight()}px`}
        transition="height .4s"
        bg="#f2f2f2"
        rounded="md"
      >
        <Scrollbars
          style={{
            height: `${getChatBoxHeight() - 8}px`,
            transition: "height .4s",
            overflowX: "hidden",
          }}
          ref={scrollRef as any}
          onScroll={onScrollHandler}
        >
          <Box pr="2" h="100%">
            {error ? (
              <Flex justify="center" direction="column" align="center" h="100%">
                <BiErrorCircle color="#718096" size="26px" />
                <Text color="gray.500" mt="2" fontSize="sm">
                  Error! Cannot load Chat.
                </Text>
              </Flex>
            ) : (
              <>
                {loading ? (
                  <Flex justify="center" align="center" h="100%">
                    <Spinner size="lg" color="poldit.100" />
                  </Flex>
                ) : (
                  <>
                    {!data?.messages?.length ? (
                      <Flex justify="center" align="center" h="100%">
                        <Text color="gray.500" mt="2" fontSize="sm">
                          Start the conversation!
                        </Text>
                      </Flex>
                    ) : (
                      <Stack spacing="4" mt="2">
                        {data?.messages.map((d: ChatMessage) =>
                          !user || user._id !== d?.creator?._id ? (
                            <UserMssg
                              data={d}
                              key={d._id}
                              handleRef={handleRef}
                              report={report}
                              userId={userId}
                              handleScroll={handleScrollLock}
                              user={user}
                              iconColor="gray.500"
                            />
                          ) : (
                            <UserMssgWithReply
                              data={d}
                              key={d._id}
                              reply={handleRef}
                              report={report}
                              loggedIn={userId ? true : false}
                            />
                          )
                        )}
                      </Stack>
                    )}
                  </>
                )}
              </>
            )}
          </Box>
        </Scrollbars>
      </Box>
      <Box mb="2">
        {chatRef && <ReplyMssgBox data={chatRef} reply={handleRef} />}
        {answerRef && (
          <StaticCardContent data={answerRef} refAnswer={handleRef} />
        )}
        <form>
          <Flex py="1" pb="3" px={[4, 3]} bg="white" position="relative">
            {isUserRefOpen && chatUsers?.length > 0 && (
              <UserRefBox
                data={chatUsers as User[]}
                loading={chatUsersLoading}
                select={tagUserHandler}
              />
            )}
            <InputGroup>
              <Input
                name="msg"
                type="text"
                borderRadius="6px 0 0 6px"
                placeholder="Type message here..."
                id="input_chat_mssg"
                disabled={!auth?.isLoggedIn}
                value={userAnswer}
                onChange={chatInputHandler}
                _focus={{ borderColor: "poldit.100" }}
              />
            </InputGroup>
            <Button
              ml="1"
              disabled={!auth?.isLoggedIn}
              bg="gray.700"
              id="submit_chat_mssg"
              borderRadius="0 6px 6px 0"
              _focus={{ outline: "none" }}
              _hover={{ bg: "gray.800" }}
              onClick={(e) => onSend(e, false)}
              type="submit"
            >
              <RiSendPlaneFill color="white" size="20px" />
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
};

export default ChatTab;

export interface OtherUserCardProps {
  data: ChatMessage;
  handleRef: (refType: string, refObj: ChatMessage | undefined) => void;
  report: (contentId: string, contentType: string, creator: string) => void;
  userId: any;
  handleScroll: (val: boolean) => void;
  size?: "xs" | "sm" | "md" | "lg";
  txtColor?: string;
}

export const OtherUserCard = ({
  data,
  handleRef,
  report,
  userId,
  handleScroll,
  size,
}: OtherUserCardProps) => {
  const { getButtonProps, getDisclosureProps, isOpen, onClose } =
    useDisclosure();
  const [hidden, setHidden] = useState(!isOpen);

  return (
    <Box>
      <HStack spacing="5">
        <Link href={`/Profile/${data?.creator?.appid}`} passHref>
          <ChakraLink isExternal>
            <Flex
              position="relative"
              ml="3"
              // w="100%"
              alignItems={"center"}
            >
              <Tooltip
                label={data?.creator?.appid}
                hasArrow
                placement="top-start"
              >
                <Avatar
                  name={`${data?.creator?.firstname} ${data?.creator?.lastname}`}
                  src={data?.creator?.profilePic}
                  size={size ?? "md"}
                  cursor="pointer"
                  bg="gray.500"
                  color="white"
                />
              </Tooltip>
              {data.isActive && (
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

        <MssgWithReply
          data={data}
          reply={handleRef}
          report={report}
          loggedIn={userId ? true : false}
        />
      </HStack>
      <HStack ml="2">
        <Box w="65px" />
        <Box ml="5">
          {userId ? (
            <>
              <Flex alignSelf={"flex-start"} mt="-2" ml="1">
                <Text fontSize="xs" color="gray.500" mt="1">
                  <TimeAgo date={data.creationDate} live={false} />
                </Text>
                <PollChatSettings
                  mssg={data}
                  reply={handleRef}
                  isMe={false}
                  report={report}
                  loggedIn={userId ? true : false}
                />
              </Flex>
            </>
          ) : (
            <Flex alignSelf={"flex-start"} mt="2" ml="1">
              <Text fontSize="xs" color="gray.500" mt="1">
                <TimeAgo date={data.creationDate} live={false} />
              </Text>
              <PollChatSettings
                mssg={data}
                reply={handleRef}
                isMe={false}
                report={report}
                loggedIn={userId ? true : false}
              />
            </Flex>
          )}
        </Box>
      </HStack>
    </Box>
  );
};

type Reply = (refType: string, msg: any) => void;

interface ReplymssgBox {
  data: ChatMessage;
  reply: Reply;
  report: (contentId: string, contentType: string, creator: string) => void;
  loggedIn: boolean;
  customColor?: string;
}

export const ReplyMssgBox = ({
  data,
  reply,
}: {
  data: ChatMessage;
  reply: Reply;
}) => (
  <Box
    bg={"gray.200"}
    px={[4, 3]}
    ml="3"
    mr="3"
    borderRadius={"md"}
    mb="1"
    color="gray.600"
  >
    <Flex justifyContent="space-between" pt="1">
      <Text color="poldit.100" fontWeight={"semibold"}>
        {data.creator.appid}
      </Text>
      <CloseButton
        alignSelf={"center"}
        _focus={{ outline: "none" }}
        size="xs"
        fontSize={"8px"}
        onClick={() => reply("", undefined)}
      />
    </Flex>
    <Text pt="1" pb="1" noOfLines={2} fontSize="xs" whiteSpace={"normal"}>
      {data.message}
    </Text>
  </Box>
  // <Flex
  //   bg={"gray.200"}
  //   px={[4, 3]}
  //   ml="3"
  //   mr="3"
  //   borderRadius={"md"}
  //   justifyContent="space-between"
  //   mb="2"
  //   color="gray.600"
  // >
  //   <Box p="2">
  //     <Text color="poldit.100" fontWeight={"semibold"}>
  //       {data.creator.appid}
  //     </Text>
  //     <Text pt="2" noOfLines={2} fontSize="sm" whiteSpace={"normal"}>
  //       {data.message}
  //     </Text>
  //   </Box>
  //   <CloseButton
  //     alignSelf={"center"}
  //     _focus={{ outline: "none" }}
  //     onClick={() => reply("", undefined)}
  //   />
  // </Flex>
);

export const UserMssgWithReply = ({
  data,
  reply,
  report,
  loggedIn,
  customColor,
}: ReplymssgBox) => {
  return (
    <Flex direction={"column"} justifyContent={"flex-end"}>
      <HStack w="100%" spacing={0} display="flex" justifyContent={"flex-end"}>
        <Box
          bg={customColor ?? "gray.700"}
          borderRadius="18px 18px 18px 0px"
          minW={data.ansRef ? "60%" : "40%"}
          maxW="80%"
          p={data.msgRef ? "2" : "0"}
        >
          {data.msgRef && <MsgReference_Static data={data} />}
          {data.ansRef && <AnswerReference_Static data={data} />}

          <UserReference_Mssg
            mssg={data.message}
            txtStyle={{
              color: "white",
              fontSize: "sm",
              pt: "2",
              pl: "4",
              pr: "3",
              textAlign: "start",
            }}
          />
          <Text fontSize="xs" color="gray.300" p="2" textAlign={"end"} pb="3">
            <TimeAgo date={data.creationDate} live={false} />
          </Text>
        </Box>
        <Center>
          <PollChatSettings
            mssg={data}
            reply={reply}
            isMe={true}
            report={report}
            loggedIn={loggedIn}
          />
        </Center>
      </HStack>
      <Flex justifyContent={"flex-end"} mr="6">
        <ChatReactBar_Selected data={data} txtColor="gray.500" />
      </Flex>
    </Flex>
  );
};

const MssgWithReply = ({ data, reply, report, loggedIn }: ReplymssgBox) => (
  <Flex
    my="2"
    bg="white"
    direction="column"
    alignItems="flex-start"
    maxW="70%"
    // minW={data.ansRef && "60%"}
    borderRadius="18px 18px 0 18px"
    boxShadow="0 0 32px rgb(0 0 0 / 8%), 0rem 16px 16px -16px rgb(0 0 0 / 10%);"
    p={data.msgRef ? "2" : "0"}
  >
    <Box w="100%">
      {data.msgRef && <MsgReference_Static data={data} />}
      {data.ansRef && <AnswerReference_Static data={data} />}
    </Box>

    <UserReference_Mssg
      mssg={data.message}
      txtStyle={{
        color: "gray.700",
        fontSize: "sm",
        padding: "4",
      }}
    />
  </Flex>
);

// const MssgWithReply = ({ data, reply, report, loggedIn }: ReplymssgBox) => (
//   <Stack spacing="0" my="2">
//     <Flex
//       bg="white"
//       direction="column"
//       alignItems="flex-start"
//       maxW="250px"
//       // maxW="300px" minW={data.ansRef && "60%"}
//       borderRadius="18px 18px 0 18px"
//       boxShadow="0 0 32px rgb(0 0 0 / 8%), 0rem 16px 16px -16px rgb(0 0 0 / 10%);"
//       p={data.msgRef ? "2" : "0"}
//     >
//       {data.msgRef && <MsgReference_Static data={data} />}
//       {data.ansRef && <AnswerReference_Static data={data} />}
//       <UserReference_Mssg mssg={data.message} color="gray.700" />
//     </Flex>
//     {/* <ChatReactionBar /> */}
//     {/* <Flex alignSelf={"flex-start"}>
//       <Text fontSize="xs" color="gray.500" ml="2" mt="1">
//         <TimeAgo date={data.creationDate} live={false} />
//       </Text>
//       <PollChatSettings
//         mssg={data}
//         reply={reply}
//         isMe={false}
//         report={report}
//         loggedIn={loggedIn}
//       />
//     </Flex> */}
//   </Stack>
//   // <Flex
//   //   my="2"
//   //   direction="column"
//   //   alignItems="flex-start"
//   //   maxW="70%"
//   //   minW={data.ansRef && "60%"}
//   // >
//   //   <Box
//   //     bg="white"
//   //     w="100%"
//   //     borderRadius="18px 18px 0 18px"
//   //     boxShadow="0 0 32px rgb(0 0 0 / 8%), 0rem 16px 16px -16px rgb(0 0 0 / 10%);"
//   //     p={data.msgRef ? "2" : "0"}
//   //   >
//   //     {data.msgRef && <MsgReference_Static data={data} />}
//   //     {data.ansRef && <AnswerReference_Static data={data} />}
//   //     <UserReference_Mssg mssg={data.message} color="gray.700" />
//   //   </Box>
//   //   {/* <ChatReactionBar /> */}
//   //   <Flex alignSelf={"flex-start"}>
//   //     <Text fontSize="xs" color="gray.500" ml="2" mt="1">
//   //       <TimeAgo date={data.creationDate} live={false} />
//   //     </Text>
//   //     <PollChatSettings
//   //       mssg={data}
//   //       reply={reply}
//   //       isMe={false}
//   //       report={report}
//   //       loggedIn={loggedIn}
//   //     />
//   //   </Flex>
//   // </Flex>
// );
