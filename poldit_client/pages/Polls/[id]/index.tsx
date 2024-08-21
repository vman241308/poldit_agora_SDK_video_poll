import React, { useEffect, useState } from "react";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import {
  Answer,
  ChatMessage,
  ChatUser,
  SelectedImage,
} from "../../../components/appTypes/appType";
import PollQuestion from "../../../components/pageComponents/Poll/Question";
import { useMutation, useQuery } from "@apollo/client";
import {
  addAnswer_updateLimits,
  updateViewCount,
} from "../../../lib/apollo/apolloFunctions/mutations";
import {
  Box,
  Flex,
  useToast,
  Spinner,
  useDisclosure,
  Stack,
  Center,
} from "@chakra-ui/react";

import { useRouter } from "next/router";
import { useAuth } from "_components/authProvider/authProvider";
import Layout from "_components/layout/Layout";
import { getAuthId } from "_components/authProvider";
import { clearStoredSearch } from "_components/globalFuncs";
import { RawDraftContentState } from "draft-js";
import { richTxt_toTxt } from "_components/pageComponents/Other/RichText/richTxtFuncs";
import Metadata from "_components/pageComponents/Other/Metadata";
import { initializeApollo } from "lib/apollo";
import CustomToast from "_components/pageComponents/Other/Toast";
import { BiErrorCircle } from "react-icons/bi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import ReportModal from "_pageComponents/Poll/Report";
import AppMssg from "_components/pageComponents/Other/AppMssgs";
import Mobile_View from "_components/pageComponents/Poll/mobile";
import Desktop_View from "_components/pageComponents/Poll/desktop";
import VideoPoll from "_components/pageComponents/Poll/Video/index";
import LogInModal from "_components/pageComponents/Other/Modal/Login";
import useLiveStream from "_components/hooks/media/useLiveStream";

const { GET_POLL, GET_USER_FOR_POLL } = GraphResolvers.queries;

let isDev =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? true
    : false;

export type AddAnswerFn = (
  answer: string | RawDraftContentState,
  answerImage: SelectedImage | string
) => Promise<"done" | "err" | undefined>;

const Poll = ({ poll }: { poll: string }) => {
  const router = useRouter();
  const userId = getAuthId();
  const auth = useAuth();
  const toast = useToast();
  const liveStream = useLiveStream(router.query.id as string, userId);
  const sessionUserId = getAuthId();

  const initRptContent = { contentId: "", contentType: "", creator: "" };

  //States
  const [question, setQuestion] = useState("");
  const [refAnswer, setRefAnswer] = useState<Answer>();
  const [replyMssg, setReplyMssg] = useState<ChatMessage>();
  const [rptContent, setRptContent] = useState(initRptContent);
  const [isMobile, setIsMobile] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  const [ansOpen, setAnsOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);

  const {
    isOpen: isRptOpen,
    onOpen: onRptOpen,
    onClose: onRptClose,
  } = useDisclosure();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const pollId = router.query.id;

  const { data, subscribeToMore: pollSubscribe } = useQuery(GET_POLL, {
    variables: { pollId },
    onCompleted: (res) => setQuestion(res.poll.question),
  });

  const {
    data: answerData,
    loading,
    error: answerError,
    subscribeToMore,
  } = useQuery(GraphResolvers.queries.GET_ANSWERS_BY_POLL, {
    variables: { pollId },
    // fetchPolicy: "cache-and-network",
  });

  const {
    data: userList,
    loading: userListLoading,
    error: userListError,
    subscribeToMore: userSubscribe,
  } = useQuery(GraphResolvers.queries.GET_POLL_CHAT_USERS, {
    variables: { pollId },
  });

  const {
    loading: chatLoading,
    error: chatErr,
    data: chatData,
    subscribeToMore: chatSubscribeMore,
    fetchMore: chatFetchMore,
  } = useQuery(GraphResolvers.queries.GET_POLL_CHAT_PAGES, {
    variables: { cursor: "", pollId, limit: 10 },
    notifyOnNetworkStatusChange: true,
  });

  const { data: user } = useQuery(GET_USER_FOR_POLL, { variables: { pollId } });

  const [addAnswerToPolls, { loading: addAnsLoading }] = useMutation(
    GraphResolvers.mutations.CREATE_ANSWER
  );

  // const [reportContent] = useMutation(GraphResolvers.mutations.REPORT_CONTENT);

  const [addView] = useMutation(GraphResolvers.mutations.ADD_VIEW);
  const [addFollower] = useMutation(
    GraphResolvers.mutations.ADD_TO_FOLLOWER_LIST
  );
  const [removeFollower] = useMutation(
    GraphResolvers.mutations.REMOVE_FROM_FOLLOWER_LIST
  );
  const [removeUserFromChat] = useMutation(
    GraphResolvers.mutations.REMOVE_CHAT_USER
  );

  const referenceHandler = (
    refType: string,
    refObj: Answer | ChatMessage | undefined
  ) => {
    if (refType === "answer") {
      setReplyMssg(undefined);
      setRefAnswer(refObj as Answer);

      isMobile &&
        toast({
          id: "ansRef",
          duration: 3000,
          position: "bottom",
          render: () => (
            <CustomToast
              msg={"Go to Discussion tab to talk about this answer!"}
              bg={"green.300"}
              fontColor={"white"}
              iconSize={"20px"}
              Icon={IoCheckmarkCircleOutline}
            />
          ),
        });

      return;
    }

    if (refType === "chat") {
      setRefAnswer(undefined);
      setReplyMssg(refObj as ChatMessage);
      return;
    }
    setRefAnswer(undefined);
    setReplyMssg(undefined);
  };

  // //Component Mounted

  useEffect(() => {
    clearStoredSearch();
    auth?.handleSearch("");
  }, []);

  // useEffect(() => {
  //   console.log("triggered effect");
  //   if (!sessionUserId) {
  //     console.log("no session user found");
  //     setLoggedOut(true);
  //     return;
  //   }

  //   setLoggedOut(false);
  // }, [loggedOut]);

  useEffect(() => {
    const userId = getAuthId();
    !userId && setLoggedOut(true);

    addFollower({
      variables: { userId, pagePath: router.asPath, pollId },
    });
    return () => {
      userId &&
        removeFollower({
          variables: { userId },
        });
    };
  }, []);

  useEffect(() => {
    !isDev && updateViewCount(addView, pollId);
  }, []);

  useEffect(() => {
    pollSubscribe({
      document: GraphResolvers.subscriptions.UPDATE_QUESTION_SUBSCRIPTION,
      variables: { pollId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        let updatedQuestion = {
          ...subscriptionData.data.updateQuestion,
        };

        // console.log({ prev, updatedQuestion });
      },
    });
  }, []);

  useEffect(() => {
    subscribeToMore({
      document: GraphResolvers.subscriptions.ANSWER_SUBSCRIPTION,
      variables: { pollId },
      updateQuery: (prev, { subscriptionData }) => {
        console.log({prev, subscriptionData, pollId})
        if (!subscriptionData.data) return prev;
        let newAnswerItem = {
          ...subscriptionData.data.newAnswer,
        };

        if (sessionUserId === newAnswerItem.creator._id) {
          newAnswerItem = {
            ...newAnswerItem,
            isEditable: true,
            isRemoveable: true,
          };
        }
        const answerMatchIdx: number = prev?.answersByPoll.findIndex(
          (item: Answer) => item._id === newAnswerItem._id
        );

        if (answerMatchIdx > -1) {
          let updatedAnswersByPoll: Answer[] = [];

          if (newAnswerItem.isRemoved) {
            //Answer is being removed
            updatedAnswersByPoll = prev.answersByPoll.filter(
              (item: Answer) => item._id !== newAnswerItem._id
            );
          } else {
            //Answer already exists.  This is for likes and dislikes count update without adding new answer
            updatedAnswersByPoll = prev.answersByPoll.map(
              (item: Answer, idx: number) => {
                if (idx === answerMatchIdx) {
                  return newAnswerItem;
                } else return item;
              }
            );
          }

          if (newAnswerItem.poll._id === pollId) {
            console.log('triggered new answer poll id matching the current poll id when updating an answer')
            return Object.assign({}, prev, {
              answersByPoll: updatedAnswersByPoll,
            });
          }

          return prev;
        }

        if (newAnswerItem.poll._id === pollId) {
          console.log('triggered new answer poll id matching the current poll id for a new answer')
          return Object.assign({}, prev, {
            answersByPoll: [...prev.answersByPoll, newAnswerItem],
          });
        }
        return prev;
      },
    });
  }, []);

  const handleCloseLoginModal = () => {
    // router.push("/Login");
    // setLoggedOut(false);
    onClose();
  };

  const isFollowed = (chatUser: ChatUser) => {
    //Check if users on list are being followed
    const userId = auth?.authState?.getUserData?._id;
    return chatUser.followers.some((x) => x._id === userId);
  };

  const subScribeHandler_userList = () => {
    userSubscribe({
      document: GraphResolvers.subscriptions.POLL_CHAT_USER_SUBSCRIPTION,
      variables: { pollId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) return prev;
        const newUser: ChatUser = subscriptionData?.data?.newChatUser;

        let pollChatUsers: ChatUser[] = [];

        //Remove Chat User from User List when User leaves poll page
        if (newUser && newUser.remove) {
          const updatedList: any = prev?.pollChatUsers.filter(
            (item: { id: string }) => item.id !== newUser.id
          );

          return { pollChatUsers: updatedList };
        }

        const prevMatch = prev?.pollChatUsers.some(
          (item: ChatUser) =>
            item.id === newUser.id && item.pollId === newUser.pollId
        );

        //This ensures same user doesnt keep showing up multiple times on User List
        // Or they arent showing up in other polls user list
        if (prevMatch || newUser.pollId !== pollId) {
          pollChatUsers = prev.pollChatUsers.map((item: ChatUser) => {
            return { ...item, isFollowed: isFollowed(item) };
          });

          return { pollChatUsers };
        }
        //Check if users on list are being followed
        pollChatUsers = [...prev.pollChatUsers, newUser].map((item) => {
          return { ...item, isFollowed: isFollowed(item) };
        });

        return { pollChatUsers };
      },
    });
  };

  useEffect(() => {
    subScribeHandler_userList();

    return () => {
      const appUser = auth?.authState?.getUserData?._id;

      appUser &&
        pollId &&
        removeUserFromChat({
          variables: { userId: appUser, pollId },
        });
      subScribeHandler_userList();
    };
  }, []);

  // //Functions

  const addAnswer = async (
    answer: string | RawDraftContentState,
    answerImage: SelectedImage | string
  ) => {
    if (data) {
      const answerObj: any = {
        answer,
        poll: data?.poll?._id,
        multichoice: [],
        answerImage,
        isEditable: true,
        isRemoveable: true,
      };

      try {
        const resp = await addAnswer_updateLimits(
          addAnswerToPolls,
          JSON.stringify(answerObj)
        );

        if (resp) {
          toast({
            id: "answerAdded",
            duration: 3000,
            position: "bottom",
            render: () => (
              <CustomToast
                msg={"Answer added!"}
                bg={"green.300"}
                fontColor={"white"}
                iconSize={"20px"}
                Icon={IoCheckmarkCircleOutline}
              />
            ),
          });

          return "done";
        }
      } catch (err: any) {
        toast({
          id: "addAnswerError",
          duration: 3000,
          position: "bottom",
          render: () => (
            <CustomToast
              msg={err.message}
              bg={"red.300"}
              fontColor={"white"}
              iconSize={"20px"}
              Icon={BiErrorCircle}
            />
          ),
        });
        return "err";
      }
    }
  };

  const reportPollContent = async (
    contentId: string,
    contentType: string,
    creator: string
  ) => {
    onRptOpen();
    setRptContent({ contentId, contentType, creator });
  };

  const handleMobile = (windowWidth: number) => {
    if (windowWidth <= 1000) {
      setIsMobile(true);
      return;
    }

    setIsMobile(false);
  };

  const getWindowDimensions = () => {
    if (typeof window !== "undefined") {
      const browserWidth = window.innerWidth;

      handleMobile(browserWidth);
    }
  };

  useEffect(() => {
    handleMobile(window.innerWidth);

    window.addEventListener("resize", getWindowDimensions);

    return () => window.removeEventListener("resize", getWindowDimensions);
  }, []);

  return (
    <Layout>
      <Metadata title="Poldit Poll" description={poll} url={pollId as string} />
      {!data ? (
        <Flex h="95vh" justifyContent={"center"} alignItems="center">
          <Spinner color="poldit.100" size={"xl"} />
        </Flex>
      ) : (
        <Box py="6">
          {data.poll.pollType === "videoPoll" ? (
            <VideoPoll
              pollData={data.poll}
              report={reportPollContent}
              question={question}
              update={setQuestion}
              user={user && user?.getUserDataForPoll}
              addAnswer={addAnswer}
              answerRef={refAnswer}
              // ansLoading={addAnsLoading}
              chatRef={replyMssg}
              handleRef={referenceHandler}
              chatData={chatData?.messageFeedByPoll}
              chatLoading={chatLoading}
              chatErr={chatErr}
              chatSubscribeToMore={chatSubscribeMore}
              chatFetchMore={chatFetchMore}
              liveStream={liveStream}
            />
          ) : (
            <>
              {isMobile ? (
                <Stack spacing="4" maxH="120vh">
                  <PollQuestion
                    pollData={data.poll}
                    report={reportPollContent}
                    question={question}
                    update={setQuestion}
                  />
                  {/* <LogInModal
                    isOpen={loggedOut}
                    onOpen={onOpen}
                    onClose={handleCloseLoginModal}
                  /> */}
                  {!user && (
                    <Box pt="5" pb="5">
                      <AppMssg
                        msg="Register or log in to create and answer polls, see who's online, and chat with the community!"
                        msgType="warning"
                        route="/Login"
                      />
                    </Box>
                  )}
                  <Mobile_View
                    isMobile={isMobile}
                    answers={answerData?.answersByPoll}
                    answersLeft={user?.getUserDataForPoll?.pollAnswersLeft}
                    handleRef={referenceHandler}
                    loading={loading}
                    addAnswer={addAnswer}
                    pollId={data.poll._id}
                    pollType={data.poll.pollType}
                    error={answerError}
                    report={reportPollContent}
                    submitLoading={addAnsLoading}
                    userList={userList?.pollChatUsers ?? []}
                    user={user && user?.getUserDataForPoll}
                    answerRef={refAnswer}
                    chatRef={replyMssg}
                    userListloading={userListLoading}
                    userListErr={userListError}
                    chatData={chatData?.messageFeedByPoll}
                    chatLoading={chatLoading}
                    chatErr={chatErr}
                    chatSubscribeToMore={chatSubscribeMore}
                    chatFetchMore={chatFetchMore}
                  />
                </Stack>
              ) : (
                <Center flexDir={"column"}>
                  <Box w="80vw">
                    <PollQuestion
                      pollData={data.poll}
                      report={reportPollContent}
                      question={question}
                      update={setQuestion}
                    />
                  </Box>
                  {/* <LogInModal
                    isOpen={loggedOut}
                    onOpen={onOpen}
                    onClose={handleCloseLoginModal}
                  /> */}
                  {!user && (
                    <Box w="80vw" mt="5" mb="-5">
                      <AppMssg
                        msg="Register or log in to create and answer polls, see who's online, and chat with the community!"
                        msgType="warning"
                        route="/Login"
                      />
                    </Box>
                  )}

                  <Box w="80vw">
                    <Desktop_View
                      isMobile={isMobile}
                      answers={answerData?.answersByPoll}
                      answersLeft={user?.getUserDataForPoll?.pollAnswersLeft}
                      handleRef={referenceHandler}
                      loading={loading}
                      addAnswer={addAnswer}
                      pollId={data.poll._id}
                      pollType={data.poll.pollType}
                      error={answerError}
                      report={reportPollContent}
                      submitLoading={addAnsLoading}
                      userList={userList?.pollChatUsers ?? []}
                      user={user && user?.getUserDataForPoll}
                      answerRef={refAnswer}
                      chatRef={replyMssg}
                      userListloading={userListLoading}
                      userListErr={userListError}
                      chatData={chatData?.messageFeedByPoll}
                      chatLoading={chatLoading}
                      chatErr={chatErr}
                      chatSubscribeToMore={chatSubscribeMore}
                      chatFetchMore={chatFetchMore}
                    />
                  </Box>
                </Center>
              )}
            </>
          )}

          <ReportModal
            content={rptContent}
            isOpen={isRptOpen}
            onClose={onRptClose}
          />
        </Box>
      )}
    </Layout>
  );
};

export default Poll;

//This empty prop getServerSideProps is required so page refresh doesnt return error on missing pollId
export async function getServerSideProps(ctx: any) {
  const client = initializeApollo();

  const { data } = await client.query({
    query: GET_POLL,
    variables: { pollId: ctx.params.id },
  });

  return { props: { poll: richTxt_toTxt(data.poll.question) } };
}
