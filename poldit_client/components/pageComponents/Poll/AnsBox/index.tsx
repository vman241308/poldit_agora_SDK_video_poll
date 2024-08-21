import {
  Box,
  Flex,
  Select,
  Text,
  IconButton,
  Spinner,
  useDisclosure,
  useToast,
  CloseButton,
  Tag,
  HStack,
  Stack,
  TagLabel,
  TagLeftIcon,
} from "@chakra-ui/react";
import TimeAgo from "react-timeago";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import { BiErrorCircle } from "react-icons/bi";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";
import { useMutation, ApolloError } from "@apollo/client";
import Pagination from "react-js-pagination";
import EditAnsModal from "./EditAnsModal";
import Link from "next/link";
import MultiChoiceCard from "./MultiChoiceCard";
import { useAuth } from "_components/authProvider/authProvider";
import { AnsBoxProps, Answer, ChatMessage } from "_components/appTypes/appType";
import AddAnswerInput from "./AddAnswerInput";
import { convertFromRaw, RawDraftContentState } from "draft-js";
import RichTxtOut from "_components/pageComponents/Other/RichText/RichTxtOut";
import Scrollbars from "_components/pageComponents/Other/Scrollbar";
import RemoveAnsModal from "./removeAnswer";
import PollAnswerSettings from "_components/pageComponents/Other/Settings/Answer";
import { getAuthId } from "_components/authProvider";
import {
  BsHandThumbsDown,
  BsHandThumbsDownFill,
  BsHandThumbsUp,
  BsHandThumbsUpFill,
} from "react-icons/bs";
import CustomToast from "_components/pageComponents/Other/Toast";
import AnswerContentIcons from "./AnswerContentIcons";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { CustomEditor } from "_components/pageComponents/Editor/functions";
import { BoxError } from "_components/pageComponents/Error/compError";
import useMultiChoice from "_components/hooks/useMultiChoice";
import { SiProbot } from "react-icons/si";

export type AddAnswer = (
  answer: string | RawDraftContentState,
  answerImage: string
) => void;

const AnsBox = ({
  loading,
  answers,
  answersLeft,
  handleRef,
  addAnswer,
  pollId,
  pollType,
  error,
  report,
  submitLoading,
  isMobile,
}: AnsBoxProps) => {
  const toast = useToast();
  const userId = getAuthId();
  const [sortBy, setSortBy] = useState<string>("rank");
  const [noOfAns, setNoOfAns] = useState<string>("5");
  // const [myVote, setMyVote] = useState<string | undefined>("");
  const [ansState, setAnsState] = useState<any[]>([]);
  const [orgAns, setOrgAns] = useState<any[] | null>(null);
  const [page, setPage] = useState(1);
  // const [selectedImgs, setSelectedImgs] = useState<any>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [handleLikes_disLikes] = useMutation(
    GraphResolvers.mutations.LIKE_DISLIKE_HANDLER
  );

  const auth = useAuth();

  const { multiChoiceHandler, multiError, multiLoading, myVote } =
    useMultiChoice(pollType, false);

  useEffect(() => {
    if (answers) {
      let sortArray = [...answers.filter((x) => !x.isRemoved)];

      if (sortBy === "rank") {
        sortArray.sort((a, b) =>
          //@ts-ignore
          a.rank.localeCompare(b.rank, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
      }
      if (sortBy === "mostLiked") {
        sortArray.sort((a, b) => b.likes?.length - a.likes?.length);
      }
      if (sortBy === "mostDisliked") {
        sortArray.sort((a, b) => b.dislikes?.length - a.dislikes?.length);
      }
      if (sortBy === "newest") {
        sortArray.sort(function (a, b) {
          const aDate: any = new Date(a.creationDate);
          const bDate: any = new Date(b.creationDate);
          return bDate - aDate;
        });
      }
      setOrgAns(sortArray);
    }
  }, [answers, sortBy]);

  useEffect(() => {
    let num = Number(noOfAns) as number;
    if (orgAns) {
      const pagination = orgAns.slice(num * page - num, num * page);
      setAnsState(pagination);
    }
  }, [orgAns, page, noOfAns, sortBy]);

  const likeHandler = (
    feedback: string,
    feedbackVal: boolean,
    answerId: string
  ) => {
    handleLikes_disLikes({
      variables: {
        feedback,
        feedbackVal,
        answerId,
        pollId: pollId,
        isVideo: false,
      },
    });
  };

  const numAnswers = () => {
    answers ? `${answers.length} Answers` : "Answers";

    if (answers && answers.length === 1) {
      return "1 Answer";
    }

    if (answers && answers.length > 1) {
      return `${answers.length} Answers`;
    }
    return "0 Answers";
  };

  // const submitAnswer = () => {
  //   let inputValue = document.getElementById("answerInput") as HTMLInputElement;
  //   // console.log("input", inputValue.value);
  //   // console.log("files", selectedImgs);

  //   if (inputValue.value.length > 0) {
  //     addAnswer(inputValue.value, selectedImgs.length ? selectedImgs : "");
  //     inputValue.value = "";
  //     setSelectedImgs([]);
  //   }
  // };

  return (
    <Box
      bg="white"
      h="800px"
      rounded={"md"}
      // minW="350px"
      // h={isMobile ? "760px" : "800px"}
      overflow={"hidden"}
    >
      {error && (
        <Box bg="#f2f2f2" pb="6">
          <Flex minH="640px" justify="center" align="center">
            <Flex justify="center" direction="column" align="center">
              <BiErrorCircle color="#718096" size="26px" />
              <Text color="gray.500" mt="2" fontSize="sm">
                Error! Cannot load Answers.
              </Text>
            </Flex>
          </Flex>
        </Box>
      )}
      {loading && (
        <Flex justify="center" align="center" color="poldit.100" h="100%">
          <Spinner size="lg" />
        </Flex>
      )}
      {pollType === "multiChoice" ? (
        <Flex h="100%" flexDirection={"column"}>
          <Flex h="60px" align="end" justify="center" alignItems={"center"}>
            <Text
              fontSize="md"
              color="gray.600"
              fontWeight="bold"
              align="center"
            >
              Select your favorite answer
            </Text>
          </Flex>
          <Scrollbars style={{ height: "730px" }}>
            {
              <Box
                py={6}
                px={[4, 6]}
                bg="#f2f2f2"
                rounded="6px"
                m="3"
                flex="1"
                overflow={"hidden"}
                h="95%"
              >
                {multiError ? (
                  <BoxError
                    msg={"Something went wrong!  Please reload the page."}
                    h="590px"
                  />
                ) : (
                  <Stack spacing="4">
                    {answers?.length > 0 &&
                      answers[0]?.multichoice?.map((x: any, id: number) => (
                        <MultiChoiceCard
                          data={x}
                          key={x._id}
                          answer={answers[0]}
                          choose={multiChoiceHandler}
                          myVote={myVote(answers)}
                          loading={multiLoading}
                          style={{ p: "4" }}
                        />
                      ))}
                  </Stack>
                )}
              </Box>
            }
          </Scrollbars>
        </Flex>
      ) : (
        <Flex h="100%" flexDirection={"column"}>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            py={4}
            px={[4, 6]}
          >
            <HStack w="50%" spacing={"4"}>
              <Text fontSize="sm" color="gray.600">
                Sort by
              </Text>
              <Select
                border="1px"
                borderColor="#d2d2d7"
                size="sm"
                maxW="160px"
                value={sortBy}
                _focus={{ outline: "none" }}
                onChange={(val) => setSortBy(val.target.value)}
              >
                <option value="rank">Rank</option>
                <option value="mostLiked">Most Liked</option>
                <option value="mostDisliked">Most Disliked</option>
                <option value="newest">Newest</option>
              </Select>
            </HStack>

            <Text fontWeight={"semibold"} color="gray.500">
              {numAnswers()}
            </Text>
          </Flex>
          <Flex px="4" py="6" flexDirection="column">
            <AddAnswerInput
              addAnswer={addAnswer}
              answersLeft={answersLeft}
              limit={5}
              isOpen={isOpen}
              onOpen={onOpen}
              onClose={onClose}
              submitLoading={submitLoading}
            />
          </Flex>
          {!isOpen && (
            <Box
              bg="#f2f2f2"
              rounded="10px"
              h="70%"
              // h={isOpen ? "30%" : "70%"}
              ml="3"
              mr="3"
              // mr="4"
            >
              {!ansState.length ? (
                <Flex h="100%" justify="center" align="center">
                  <Text color="gray.500" fontSize="sm">
                    Add the first answer!
                  </Text>
                </Flex>
              ) : (
                <Scrollbars style={{ height: isOpen ? "220px" : "550px" }}>
                  {ansState &&
                    ansState.map((c: any) => (
                      <Box key={c._id} px={4}>
                        <CardContent
                          data={c}
                          userId={userId}
                          likes={c?.likes?.length}
                          dislikes={c?.dislikes?.length}
                          likeHandler={likeHandler}
                          pollId={pollId}
                          handleRef={handleRef}
                          report={report}
                          loggedIn={userId ? true : false}
                        />
                      </Box>
                    ))}
                </Scrollbars>
              )}
            </Box>
          )}
          {answers?.length > 0 && !isOpen && (
            <Flex flex="1" align="center" justify="center" mt="3">
              <Pagination
                activePage={page}
                prevPageText="Prev"
                nextPageText="Next"
                itemsCountPerPage={Number(noOfAns)}
                totalItemsCount={answers && answers?.length}
                pageRangeDisplayed={5}
                onChange={(e: any) => setPage(e)}
                itemClass="page-item"
                linkClass="page-link"
              />
            </Flex>
          )}
        </Flex>
      )}
    </Box>
  );
};

export type HandleReference = (refType: string, refObj: Answer) => void;
export type ReportAnswer = (
  contentId: string,
  contentType: string,
  creator: string
) => void;

interface CardContent {
  data: Answer;
  likes: number;
  dislikes: number;
  likeHandler: (
    feedback: string,
    feedbackVal: boolean,
    answerId: string
  ) => void;
  pollId: string;
  handleRef: HandleReference;
  report: ReportAnswer;
  loggedIn: boolean;
  userId: string;
  isStatic?: boolean;
}

export const CardContent = ({
  data,
  likes,
  dislikes,
  likeHandler,
  pollId,
  handleRef,
  report,
  loggedIn,
  userId,
  isStatic,
}: CardContent) => {
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isRemoveOpen,
    onOpen: onRemoveOpen,
    onClose: onRemoveClose,
  } = useDisclosure();

  const [showCard, setShowCard] = useState<boolean>(false);

  const handleToggle = () => setShowCard(!showCard);

  const LikeIcon = () => {
    if (data.likes.some((item) => item.userId === userId)) {
      return <BsHandThumbsUpFill size="18px" />;
    }
    return <BsHandThumbsUp size="18px" />;
  };

  const DisLikeIcon = () => {
    if (data.dislikes.some((item) => item.userId === userId)) {
      return <BsHandThumbsDownFill size="18px" />;
    }
    return <BsHandThumbsDown size="18px" />;
  };

  return (
    <Box
      bg="white"
      my="4"
      py="4"
      rounded="lg"
      id={`open_answer_${data._id}`}
      boxShadow="0 0 32px rgb(0 0 0 / 8%), 0rem 16px 16px -16px rgb(0 0 0 / 10%);"
    >
      <Flex w="100%" pl="3" pr="1">
        <Flex
          w="100%"
          justifyContent="space-between"
          alignItems={"center"}
          px={1}
          pb={1}
          borderBottom="1px"
          borderColor="#d2d2d7"
          mt="2px"
        >
          {data.creator?.appid !== "PolditAI" ? (
            <Link href={`/Profile/${data?.creator?.appid}`}>
              <Text
                color="gray.700"
                fontSize="sm"
                cursor="pointer"
                _hover={{ fontWeight: "semibold", color: "blue.400" }}
              >
                {data.creator?.appid}
              </Text>
            </Link>
          ) : (
            <Tag fontSize="sm" bg="poldit.100" color="white">
              <TagLeftIcon as={SiProbot} />
              <TagLabel>Poldit Bot</TagLabel>
            </Tag>
            // <Text color="gray.700" fontSize="sm">
            //   {data.creator?.appid}
            // </Text>
          )}
          {data.answer.startsWith('[{"type":') && (
            <AnswerContentIcons answer={data.answer} />
          )}
          <Text color="gray.700" fontSize="sm">
            <TimeAgo date={data?.creationDate} live={false} />
          </Text>
        </Flex>
        {!isStatic && (
          <PollAnswerSettings
            loggedIn={loggedIn}
            openEditor={onEditOpen}
            reportItem={report}
            styles={{ pb: "1" }}
            openRemoveModal={onRemoveOpen}
            handleReference={handleRef}
            answer={data}
          />
        )}
      </Flex>

      <Box mt="3" mb="3">
        <RichTxtOut
          contentType="Answer"
          content={data.answer}
          show={showCard}
          cardToggle={handleToggle}
          cardStyle={{ marginLeft: "4" }}
          txtStyle={{ pl: "25px", pr: "25px" }}
        />
      </Box>

      <Flex justifyContent="space-between" alignItems="center" px="3">
        <Flex justifyContent="flex-start" alignItems="center">
          <Flex justifyContent="center" alignItems="center" mr={3}>
            <IconButton
              icon={LikeIcon()}
              isDisabled={isStatic ? true : undefined}
              aria-label="thumbsup"
              id="thumbsup"
              variant="ghost"
              _focus={{ outline: "none" }}
              size="sm"
              color="green.300"
              onClick={() => likeHandler("like", true, data._id)}
            />
            <Box>
              <Text color="gray.700" fontSize="sm">
                {likes}
              </Text>
            </Box>
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            <IconButton
              icon={DisLikeIcon()}
              isDisabled={isStatic ? true : undefined}
              aria-label="thumbsdown"
              id="thumbsdown"
              variant="ghost"
              _focus={{ outline: "none" }}
              size="sm"
              color="red.300"
              mt={1}
              onClick={() => likeHandler("dislike", true, data._id)}
            />
            <Box>
              <Text color="gray.700" fontSize="sm">
                {dislikes}
              </Text>
            </Box>
          </Flex>
        </Flex>
        <Tag mr="4" bg="gray.100">
          <Text color="gray.500" fontSize="sm">
            {data?.rank === "Not Ranked" ? data?.rank : `Rank ${data?.rank}`}
          </Text>
        </Tag>
      </Flex>
      <EditAnsModal
        isEditOpen={isEditOpen}
        onEditClose={onEditClose}
        ansData={data}
        pollId={pollId}
        userId={userId}
      />
      <RemoveAnsModal
        isOpen={isRemoveOpen}
        close={onRemoveClose}
        answerId={data._id}
        pollId={pollId}
      />
    </Box>
  );
};
export default AnsBox;

interface StaticCardContent {
  data: Answer;
  refAnswer: (refType: string, ans: any) => void;
}

export const StaticCardContent = ({ data, refAnswer }: StaticCardContent) => {
  let answerVal = "";

  if (!data.isDisabled) {
    if (data.answer.startsWith('[{"type":')) {
      answerVal = CustomEditor.getPlainText(JSON.parse(data.answer)).join("/n");
    } else if (data.answer.search('"blocks":') > -1) {
      const questionRawContent: RawDraftContentState = JSON.parse(data.answer);
      const questionContent = convertFromRaw(questionRawContent);
      answerVal = questionContent.getPlainText();
    } else answerVal = data.answer;
  } else answerVal = "This content was removed due to policy violations.";

  return (
    <Flex
      bg={"gray.200"}
      px={[4, 3]}
      ml="3"
      mr="3"
      borderRadius={"md"}
      justifyContent="space-between"
      mb="2"
    >
      <Box
        bg="white"
        w="100%"
        my="4"
        py="4"
        rounded="lg"
        boxShadow="0 0 32px rgb(0 0 0 / 8%), 0rem 16px 16px -16px rgb(0 0 0 / 10%);"
      >
        <Flex w="100%" pl="3" pr="1">
          <Flex
            w="100%"
            justifyContent="space-between"
            px={1}
            pb={1}
            borderBottom="1px"
            borderColor="#d2d2d7"
            mt="2px"
          >
            <Text color="gray.700" fontSize="sm">
              {data.creator?.appid}
            </Text>
            <Flex
              alignItems={"center"}
              w="20%"
              justifyContent={"space-between"}
            >
              <Text color="gray.700" fontSize="sm">
                <TimeAgo date={data?.creationDate} live={false} />
              </Text>
              <CloseButton
                alignSelf={"center"}
                _focus={{ outline: "none" }}
                onClick={() => refAnswer("", undefined)}
              />
            </Flex>
          </Flex>
        </Flex>
        <Box pt={5} pb={1} px={5}>
          <Text
            fontSize="sm"
            noOfLines={2}
            color={data.isDisabled ? "red.400" : "gray.500"}
          >
            {answerVal}
          </Text>
        </Box>
        <Flex justifyContent="space-between" alignItems="center" px="3">
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
              <Box>
                <Text color="gray.700" fontSize="sm">
                  {data.likes?.length}
                </Text>
              </Box>
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
              <Box>
                <Text color="gray.700" fontSize="sm">
                  {data.dislikes?.length}
                </Text>
              </Box>
            </Flex>
          </Flex>
          <Tag mr="4" bg="gray.100">
            <Text color="gray.500" fontSize="sm">
              {data?.rank === "Not Ranked" ? data?.rank : `Rank ${data?.rank}`}
            </Text>
          </Tag>
        </Flex>
      </Box>
    </Flex>
  );
};
