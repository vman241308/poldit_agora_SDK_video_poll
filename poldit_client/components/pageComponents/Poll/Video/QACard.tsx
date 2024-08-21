import {
  ApolloError,
  LazyQueryExecFunction,
  OperationVariables,
  useLazyQuery,
} from "@apollo/client";
import {
  Box,
  Center,
  Flex,
  Spinner,
  Stack,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { PollHistory, User } from "_components/appTypes/appType";
import { useAuth } from "_components/authProvider/authProvider";
import AddAnswerInput from "../AnsBox/AddAnswerInput";
import QuestionInput from "./Question";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";
import { Scrollbars } from "react-custom-scrollbars-2";
// import Scrollbars from "_components/pageComponents/Other/Scrollbar";
import { QuestionCard } from "./QACardComps";
import { AddAnswerFn } from "pages/Polls/[id]";
import ContentFilter from "./ContentFilter";
import { BsHandThumbsDownFill, BsHandThumbsUpFill } from "react-icons/bs";
import { MdOutlineFiberNew } from "react-icons/md";
import { TPublishToChannel } from "_components/hooks/channel/useChannel";
import {
  IChildPollFeed,
  PollHistory_Video,
  TFetchMore,
  TUpdatePoll,
} from "_components/hooks/hooks";
import { BiErrorCircle } from "react-icons/bi";

type GetPolls = LazyQueryExecFunction<any, OperationVariables>;

export type ReactionHandler = (
  feedback: string,
  feedbackVal: boolean,
  contentId: string
) => void;

interface QACardProps {
  data: PollHistory;
  loading: boolean;
  error: ApolloError | undefined;
  updatePolls: TUpdatePoll;
  childPolls: IChildPollFeed;
  fetchMore: TFetchMore;
  getPolls: GetPolls;
  user: User;
  pollId: string;
  isHost: boolean;
  pollStarted: boolean | undefined;
  broadcast: TPublishToChannel;
  // addAnswer: AddAnswerFn;
  // ansLoading: boolean;
}

const sortBtns = [
  {
    btnName: "newest",
    title: "Newest",
    icon: MdOutlineFiberNew,
    active: true,
  },
  // {
  //   btnName: "multiChoice",
  //   title: "Multiple Choice",
  //   icon: BsHandThumbsUpFill,
  //   active: false,
  // },
  // {
  //   btnName: "openEnded",
  //   title: "Standard Questions",
  //   icon: BsHandThumbsDownFill,
  //   active: false,
  // },
  // {
  //   btnName: "mostLiked",
  //   title: "Most Liked",
  //   icon: BsHandThumbsUpFill,
  //   active: false,
  // },
  // {
  //   btnName: "mostDisliked",
  //   title: "Most Disliked",
  //   icon: BsHandThumbsDownFill,
  //   active: false,
  // },
  {
    btnName: "numAnswers",
    title: "Number of Answers",
    icon: undefined,
    active: false,
  },
];

const QACard = (props: QACardProps) => {
  const auth = useAuth();
  const scrollRef = useRef();
  // const [sortBtns, setSortBtns] = useState(initSortBtns);
  const [sortBy, setSortBy] = useState("");
  const [isBottom, setIsBottom] = useState(true);

  const onScrollHandler = async (e: any) => {
    const { scrollHeight, scrollTop, clientHeight } = e.target;
    const isBottom = scrollHeight - scrollTop === clientHeight;
    if (isBottom) {
      setIsBottom(false);
      await props.fetchMore({
        variables: { cursor: props.childPolls.cursor },
      });
    }
  };

  const sortHandler = (btn: string) => {
    setSortBy(btn);
    props.getPolls({
      variables: {
        cursor: "",
        limit: 5,
        pollId: props.pollId,
        sortBy: btn,
      },
    });
  };

  const reactionHandler = (
    feedback: string,
    feedbackVal: boolean,
    contentId: string
  ) => {
    console.log("placeholder for reactions");
  };

  useEffect(() => {
    sortHandler("newest");
  }, []);

  //   const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex h="100%" flexDir={"column"} justifyContent="space-between" pl="2">
      <Box p="2">
        <QuestionInput
          questionId={props.data._id}
          topic={props.data.topic._id}
          subtopics={props.data.subTopics}
          sort={sortHandler}
          sortBy={sortBy}
          user={props.user}
          broadcast={props.broadcast}
        />
        <ContentFilter
          btns={sortBtns}
          sortBy={sortBy}
          sort={sortHandler}
          content={"Question"}
        />
      </Box>
      <Box mb="2" h="650px" flex="1">
        <Scrollbars
          style={{ height: "98%", overflowX: "hidden" }}
          ref={scrollRef as any}
          onScroll={onScrollHandler}
          renderThumbVertical={({ style, ...props }) => {
            return (
              <div
                style={{
                  ...style,
                  backgroundColor: "#A0AEC0",
                  borderRadius: "18px",
                }}
                {...props}
              />
            );
          }}
        >
          <Box>
            {props.error ? (
              <Flex justify="center" direction="column" align="center" h="100%">
                <BiErrorCircle color="#718096" size="26px" />
                <Text color="gray.500" mt="2" fontSize="sm">
                  Error! Cannot load Q&A.
                </Text>
              </Flex>
            ) : (
              <>
                {props.loading ? (
                  <Flex justify="center" align="center" h="100%">
                    <Spinner size="lg" color="poldit.100" />
                  </Flex>
                ) : (
                  <>
                    {!props.childPolls?.polls?.length ? (
                      <Flex justify="center" align="center" h="100%">
                        <Text color="gray.500" mt="2" fontSize="sm">
                          Ask away!
                        </Text>
                      </Flex>
                    ) : (
                      <Stack spacing="3">
                        {props.childPolls?.polls?.map((x) => (
                          <QuestionCard
                            key={x._id}
                            data={x}
                            user={props.user}
                            broadcast={props.broadcast}
                            handleReactions={reactionHandler}
                            isHost={props.isHost}
                            pollStarted={props.pollStarted}
                            updatePolls={props.updatePolls}
                          />
                        ))}
                      </Stack>
                    )}
                  </>
                )}
              </>
            )}
          </Box>
        </Scrollbars>
      </Box>
    </Flex>
  );
};

export default QACard;
