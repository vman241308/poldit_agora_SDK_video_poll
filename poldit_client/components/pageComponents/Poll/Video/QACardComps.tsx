import {
  Box,
  Center,
  Collapse,
  Flex,
  Grid,
  GridItem,
  HStack,
  Icon,
  IconButton,
  Spacer,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { Answer, PollHistory, User } from "_components/appTypes/appType";
import { UserAvatar } from "../ChatBox/chatvideoComps";
import TimeAgo from "react-timeago";
import RichTxtOut from "_components/pageComponents/Other/RichText/RichTxtOut";
import {
  BsBroadcast,
  BsHandThumbsDown,
  BsHandThumbsDownFill,
  BsHandThumbsUp,
  BsHandThumbsUpFill,
} from "react-icons/bs";
import { IconType } from "react-icons/lib";
import { ReactionHandler } from "./QACard";
import { numCountDisplay } from "_components/formFuncs/miscFuncs";
import { useEffect, useState } from "react";
import Drawer from "_components/pageComponents/Other/Collapse/Drawer";
import { AnimatedBox } from "_components/pageComponents/Other/Collapse/other";
import AnswerInput from "./AnswerInput";
import AnswerCard from "./Answer";
import { motion, AnimatePresence } from "framer-motion";
import { AddAnswerFn } from "pages/Polls/[id]";
import {
  LazyQueryExecFunction,
  OperationVariables,
  useLazyQuery,
  useMutation,
} from "@apollo/client";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";
import ContentFilter from "./ContentFilter";
import useMultiChoice from "_components/hooks/useMultiChoice";
import { BiSelectMultiple } from "react-icons/bi";
import { RiFilePaper2Line } from "react-icons/ri";
import { TPublishToChannel } from "_components/hooks/channel/useChannel";
import { PollHistory_Video, TUpdatePoll } from "_components/hooks/hooks";

interface QuestionCardType {
  data: PollHistory_Video;
  user: User;
  handleReactions: ReactionHandler;
  isHost: boolean;
  pollStarted: boolean | undefined;
  broadcast: TPublishToChannel;
  updatePolls: TUpdatePoll;
}

const sortBtns = [
  {
    btnName: "newest",
    title: "Newest",
  },
  {
    btnName: "mostLiked",
    title: "Most Liked",
  },
  {
    btnName: "mostDisliked",
    title: "Most Disliked",
  },
  {
    btnName: "rank",
    title: "Rank",
  },
];

export const QuestionCard = (props: QuestionCardType) => {
  const { isOpen, onToggle } = useDisclosure();
  const [showCard, setShowCard] = useState<boolean>(false);
  const [answerSortBy, setAnswerSortBy] = useState("");

  const handleToggle = () => setShowCard(!showCard);

  const [handleLikes_disLikes] = useMutation(
    GraphResolvers.mutations.LIKE_DISLIKE_HANDLER
  );

  const [getAnswers, { data, loading, subscribeToMore }] = useLazyQuery(
    GraphResolvers.queries.GET_ANSWERS_BY_CHILD_POLL,
    {
      fetchPolicy: "network-only",
      // variables: { pollId: props.data._id },
    }
  );

  const answerReactionHandler = (
    feedback: string,
    feedbackVal: boolean,
    answerId: string
  ) => {
    handleLikes_disLikes({
      variables: {
        feedback,
        feedbackVal,
        answerId,
        pollId: props.data._id,
        isVideo: true,
      },
    });
  };

  const sortAnsHandler = (val: string) => {
    setAnswerSortBy(val);
    getAnswers({
      variables: {
        offset: 0,
        limit: 0,
        pollId: props.data._id,
        sortBy: val,
      },
    });
  };

  const answerToggle = () => {
    sortAnsHandler("newest");
    onToggle();
  };

  useEffect(() => {
    const pollId = props.data._id;

    if (data) {
      subscribeToMore({
        document: GraphResolvers.subscriptions.ANSWER_SUBSCRIPTION,
        variables: { pollId },
        // variables: { questionId: pollId },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev;
          let newAnswerItem = {
            ...subscriptionData.data.newAnswer,
          };
          console.log({ prev, newAnswerItem });

          if (props.user._id === newAnswerItem.creator._id) {
            newAnswerItem = {
              ...newAnswerItem,
              isEditable: true,
              isRemoveable: true,
            };
          }
          const answerMatchIdx: number = prev?.answersForChildPoll.findIndex(
            (item: Answer) => item._id === newAnswerItem._id
          );
          if (answerMatchIdx > -1) {
            let updatedAnswersByPoll: Answer[] = [];

            if (newAnswerItem.isRemoved) {
              //Answer is being removed
              updatedAnswersByPoll = prev.answersForChildPoll.filter(
                (item: Answer) => item._id !== newAnswerItem._id
              );
            } else {
              //Answer already exists.  This is for likes and dislikes count update without adding new answer
              updatedAnswersByPoll = prev.answersForChildPoll.map(
                (item: Answer, idx: number) => {
                  if (idx === answerMatchIdx) {
                    return newAnswerItem;
                  } else return item;
                }
              );
            }

            if (newAnswerItem.poll._id === pollId) {
              return Object.assign({}, prev, {
                answersForChildPoll: updatedAnswersByPoll,
              });
            }

            return prev;
          }

          if (newAnswerItem.poll._id === pollId) {
            return Object.assign({}, prev, {
              answersForChildPoll: [newAnswerItem, ...prev.answersForChildPoll],
            });
          }
          return prev;
        },
      });
    }
  }, []);

  return (
    <Box color="gray.700" id={`poll_${props.data._id}`} w="100%">
      <Grid
        templateRows="repeat(1, 1fr)"
        templateColumns="repeat(5, 1fr)"
        display="flex"
        w="100%"
        gap="2"
      >
        <GridItem rowSpan={1} colSpan={1}>
          <UserAvatar data={props.data} size="sm" />
        </GridItem>
        <GridItem colSpan={4} w="100%">
          <Stack>
            <QuestionCardBody
              {...props}
              showCard={showCard}
              handleToggle={handleToggle}
              answerToggle={answerToggle}
              isOpen={isOpen}
            />
            <Box>
              <AnswerSection
                data={props.data}
                isOpen={isOpen}
                answers={data?.answersForChildPoll ?? []}
                loading={loading}
                user={props.user}
                sortBy={answerSortBy}
                sort={sortAnsHandler}
                react={answerReactionHandler}
                broadcast={props.broadcast}
                // getAnswers={getAnswers}
                // pollId={props.data._id}
              />
            </Box>
          </Stack>
        </GridItem>
      </Grid>
    </Box>
  );

  // return (
  //   <Box color="gray.700" id={`poll_${props.data._id}`} mb="5" w="100%">
  //     <Stack spacing={isOpen ? 3 : -1}>
  //       <HStack spacing="2">
  //         <UserAvatar data={props.data} size="md" />
  //         <Box w="100%">
  //           <QuestionCardBody
  //             {...props}
  //             showCard={showCard}
  //             handleToggle={handleToggle}
  //             answerToggle={onToggle}
  //             isOpen={isOpen}
  //           />
  //         </Box>
  //       </HStack>
  //       <Flex>
  //         <Spacer />
  //         <AnswerSection
  //           data={props.data}
  //           isOpen={isOpen}
  //           answers={data?.answersByPoll ?? []}
  //           loading={loading}
  //           userId={props.userId}
  //         />
  //       </Flex>
  //     </Stack>
  //   </Box>
  // );
};

interface QuestionCardBodyProps extends QuestionCardType {
  showCard: boolean;
  handleToggle: () => void;
  answerToggle: () => void;
  isOpen: boolean;
}

const QuestionCardBody = (props: QuestionCardBodyProps) => {
  // const LikeIcon: IconType =
  //   props.data.likes &&
  //   props.data.likes.some((item) => item.userId === props.userId)
  //     ? BsHandThumbsUpFill
  //     : BsHandThumbsUp;
  // const DisLikeIcon: IconType =
  //   props.data.dislikes &&
  //   props.data.dislikes.some((item) => item.userId === props.userId)
  //     ? BsHandThumbsDownFill
  //     : BsHandThumbsDown;

  const update = () => {
    props.broadcast("Broadcast", {
      _id: props.data._id,
      contentType: "question",
    });
    props.updatePolls(
      props.data._id,
      "isBroadcasted",
      !props.data.isBroadcasted
    );
  };

  return (
    <Flex direction="column" bg="white" borderRadius="18px 18px 0 18px" mr="3">
      <Flex justifyContent={"space-between"} alignItems="center">
        <Text fontSize="xs" color="gray.500" p="2" pl="3">
          {props.data.creator?.appid}
        </Text>
        {props.isHost && props.pollStarted && (
          <Tooltip
            label={`${
              props.data.isBroadcasted ? "Unshare" : "Share"
            } Question with Audience`}
            hasArrow
            placement="top"
          >
            <IconButton
              aria-label={"broadcast"}
              variant="ghost"
              color={props.data.isBroadcasted ? "poldit.100" : "gray.600"}
              _focus={{ outline: "none", bg: "none" }}
              _hover={{ outline: "none", color: "poldit.100" }}
              icon={<BsBroadcast />}
              onClick={update}
            />
          </Tooltip>
        )}
      </Flex>

      <RichTxtOut
        contentType="video"
        content={props.data.question}
        fontSize={["xs", "sm", "sm", "sm"]}
        txtStyle={{ pl: "3", whiteSpace: "normal" }}
        show={props.showCard}
        cardToggle={props.handleToggle}
      />
      <Flex justifyContent={"space-between"} alignItems="center" mt="4" mb="1">
        <HStack flex={1} ml="4">
          <Tooltip
            label={`${
              props.data.pollType === "multiChoice"
                ? "Multiple choice"
                : "Standard"
            } question`}
            placement="top"
            hasArrow
            rounded="md"
            w="120px"
            textAlign={"center"}
          >
            <IconButton
              variant="outline"
              border={"white"}
              size="10px"
              _hover={{ cursor: "default" }}
              _focus={{ outline: "none", cursor: "none" }}
              fontSize="lg"
              color={"gray.500"}
              aria-label="Send email"
              icon={
                props.data.pollType === "multiChoice" ? (
                  <BiSelectMultiple />
                ) : (
                  <RiFilePaper2Line />
                )
              }
            />
          </Tooltip>
          {/* <ReactBtn
            icon={LikeIcon}
            size="16px"
            val={"like"}
            react={props.handleReactions}
            contentId={props.data._id}
            // reactionCount={getRandomNum(1, 100000)}
            reactionCount={props.data.likesCount ?? 0}
            styles={{ size: "sm", color: "green.300", id: "qthumbsup" }}
          />
          <ReactBtn
            icon={DisLikeIcon}
            val={"dislike"}
            size="16px"
            react={props.handleReactions}
            contentId={props.data._id}
            // reactionCount={getRandomNum(1, 100000)}
            reactionCount={props.data.dislikesCount ?? 0}
            styles={{ size: "sm", color: "red.300", id: "qthumbsdown" }}
          /> */}

          <Tooltip
            label={`${
              props.data.pollType === "multiChoice"
                ? "Click to select multiple choice option"
                : "Add or react to an existing answer"
            }`}
            placement="top"
            hasArrow
            rounded="md"
            w="120px"
            textAlign={"center"}
          >
            <Flex alignItems={"center"}>
              <CustomIcon
                toggleAns={props.answerToggle}
                styles={{
                  bg: props.isOpen ? "gray.700" : "white",
                  color: props.isOpen ? "white" : "poldit.100",
                  size: props.isOpen ? "xs" : "sm",
                  _hover: {
                    bg: props.isOpen ? "gray.700" : "white",
                    color: props.isOpen ? "white" : "poldit.100",
                    size: props.isOpen ? "xs" : "sm",
                  },
                }}
              />
              <Text
                color="gray.500"
                fontSize="sm"
                mb="0.5"
                ml={props.isOpen ? "1" : "0"}
              >
                {/* {numCountDisplay(getRandomNum(1, 100))} */}
                {numCountDisplay(props.data.answerCount ?? 0)}
              </Text>
            </Flex>
          </Tooltip>
        </HStack>
        <Text fontSize="xs" color="gray.500" mr="2" whiteSpace={"normal"}>
          <TimeAgo date={props.data.creationDate} live={false} />
        </Text>
      </Flex>
    </Flex>
  );
};

export type ReactProps = (
  feedback: string,
  feedbackVal: boolean,
  answerId: string
) => void;

interface AnswerSectionProps {
  isOpen: boolean;
  data: PollHistory;
  answers: Answer[];
  loading: boolean;
  user: User;
  sortBy: string;
  sort: (val: string) => void;
  react: ReactProps;
  broadcast: TPublishToChannel;
  // getAnswers: LazyQueryExecFunction<any, OperationVariables>;
  // pollId: string;
}

const AnswerSection = (props: AnswerSectionProps) => {
  const multiChoiceHook = useMultiChoice(
    props.data.pollType ?? "openEnded",
    true
  );

  // useEffect(() => {
  //   sortAnsHandler("newest");
  // }, []);

  return (
    <Collapse in={props.isOpen} animateOpacity>
      <Box>
        {props.data.pollType === "openEnded" && (
          <>
            <Flex pr="3" mb="2" rounded={"md"}>
              <AnswerInput
                pollId={props.data._id}
                sortBy={props.sortBy}
                sortAns={props.sort}
                user={props.user}
                broadcast={props.broadcast}
              />
            </Flex>
            <Box mb="2" mr="2">
              <ContentFilter
                btns={sortBtns}
                sortBy={props.sortBy}
                sort={props.sort}
                content="Answer"
              />
            </Box>
          </>
        )}
        {props.loading ? (
          <Center w="100%" p="10">
            <Spinner size="lg" color="poldit.100" />
          </Center>
        ) : (
          <Stack spacing="2">
            {props.answers.map((x) => (
              <AnswerCard
                key={x._id}
                data={x}
                userId={props.user._id}
                react={props.react}
                multiChoiceHook={multiChoiceHook}
              />
            ))}
          </Stack>
        )}

        {/* <Box mb="2">
          <ContentFilter
            btns={sortBtns}
            sortBy={props.sortBy}
            sort={props.sort}
            content="Answer"
          />
        </Box>
        {props.loading ? (
          <Center w="100%" p="10">
            <Spinner size="lg" color="poldit.100" />
          </Center>
        ) : (
          <Stack spacing="2">
            {props.answers.map((x) => (
              <AnswerCard
                key={x._id}
                data={x}
                userId={props.userId}
                react={props.react}
              />
            ))}
          </Stack>
        )} */}
      </Box>
    </Collapse>
  );
};

interface ReactBtnProps {
  icon: IconType;
  size: string;
  val: string;
  react: ReactionHandler;
  contentId: string;
  reactionCount: number;
  styles?: any;
}

export const ReactBtn = (props: ReactBtnProps) => (
  <Flex justifyContent="center" alignItems="center">
    <IconButton
      {...props.styles}
      icon={<props.icon size={props.size} />}
      aria-label={props.styles.id}
      variant="ghost"
      _focus={{ outline: "none" }}
      onClick={() => props.react(props.val, true, props.contentId)}
    />
    <Box>
      <Text color="gray.500" fontSize="sm">
        {numCountDisplay(props.reactionCount)}
      </Text>
    </Box>
  </Flex>
);

export const CustomIcon = (props: any) => (
  <IconButton
    // {...props.toggleAns()}
    {...props.styles}
    aria-label="answerIcon"
    variant="ghost"
    // color="poldit.100"
    // size="sm"
    _active={{ outline: "none" }}
    _focus={{ outline: "none" }}
    onClick={props.toggleAns}
  >
    <Text fontFamily={"malgunBody"} fontSize="lg">
      A
    </Text>
  </IconButton>
);

export const getReactionIcon = (icon: "like" | "dislike", val: boolean) => {
  if (icon === "like") {
    return val ? BsHandThumbsUpFill : BsHandThumbsUp;
  }

  if (icon === "dislike") {
    return val ? BsHandThumbsDownFill : BsHandThumbsDown;
  }
};
