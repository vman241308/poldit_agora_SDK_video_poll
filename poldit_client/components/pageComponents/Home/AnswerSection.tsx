import { Box, Flex, Link, Spinner, Stack, Tag, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { Answer, PollHistory } from "_components/appTypes/appType";
import Scrollbars from "../Other/Scrollbar";
import GraphResolvers from "_apiGraphStrings/index";
import { useQuery } from "@apollo/client";
import { BoxError } from "../Error/compError";
import { CardContent } from "../Poll/AnsBox";
import MultiChoiceCard from "../Poll/AnsBox/MultiChoiceCard";
import NextLink from "next/link";
import useTopAnswers from "_components/hooks/useAnswer";
import useMultiChoice from "_components/hooks/useMultiChoice";

interface IAnswerSectionProps {
  loggedIn: boolean;
  pollId: string;
  pollType: string | undefined;
  userId: string;
  answers: Answer[];
  close: () => void;
}

function AnswerSection({
  loggedIn,
  pollId,
  pollType,
  userId,
  answers,
  close,
}: IAnswerSectionProps) {
  const { data, loading, error } = useTopAnswers(pollId, 1);

  const { multiChoiceHandler, multiError, multiLoading, myVote } =
    useMultiChoice(pollType as string, false);

  // const { data, loading, error } = useQuery(
  //   GraphResolvers.queries.GET_TOP_ANSWERS_BY_POLL,
  //   { variables: { pollId, numAnswers: 1 } }
  // );

  const likeHandler = () => {};
  const handleRef = () => {};
  const report = () => {};
  // const multiChoiceHandler = () => {};
  // const myVote = () => {};

  // return (
  //   <Box mt="5" minH="200px" bg="gray.200" p="2">
  //     {pollType === "multiChoice" ? (
  //       <Stack spacing="4" p="2">
  //         {answers[0]?.multichoice?.map((x: any, id: number) => (
  //           <MultiChoiceCard
  //             data={x}
  //             key={x._id}
  //             answer={answers[0]}
  //             choose={multiChoiceHandler}
  //             myVote={myVote(answers)}
  //             loading={multiLoading}
  //             style={{ p: "4" }}
  //             // isStatic={true}
  //           />
  //         ))}
  //       </Stack>
  //     ) : (
  //       <>
  //         {answers.map((x) => (
  //           <CardContent
  //             key={x._id}
  //             data={x}
  //             userId={userId}
  //             likes={x?.likes?.length}
  //             dislikes={x?.dislikes?.length}
  //             likeHandler={likeHandler}
  //             pollId={pollId}
  //             handleRef={handleRef}
  //             report={report}
  //             loggedIn={loggedIn}
  //             isStatic={true}
  //           />
  //         ))}
  //       </>
  //     )}
  //   </Box>
  // );
  return (
    <Box mt="5" minH="200px" bg="gray.200" p="2">
      {loading ? (
        <Flex justify="center" align="center" color="poldit.100" h="100%">
          <Spinner size="lg" />
        </Flex>
      ) : (
        <>
          {error ? (
            <BoxError
              msg="Oops!  Something went wrong. Refresh the page and try again."
              h="100%"
            />
          ) : (
            <>
              {pollType === "multiChoice" ? (
                <Stack spacing="4" p="2">
                  <Text color="poldit.100" fontWeight={"semibold"}>
                    Select An Answer
                  </Text>
                  {data.topAnswersByPoll[0]?.multichoice?.map(
                    (x: any, id: number) => (
                      <MultiChoiceCard
                        data={x}
                        key={x._id}
                        answer={data.topAnswersByPoll[0]}
                        choose={multiChoiceHandler}
                        myVote={myVote(data.topAnswersByPoll)}
                        loading={multiLoading}
                        style={{ p: "2" }}
                        // isStatic={true}
                      />
                    )
                  )}
                </Stack>
              ) : (
                <>
                  <Text color="poldit.100" fontWeight={"semibold"}>
                    Top Answer
                  </Text>
                  {(data.topAnswersByPoll as Answer[]).map((x) => (
                    <CardContent
                      key={x._id}
                      data={x}
                      userId={userId}
                      likes={x?.likes?.length}
                      dislikes={x?.dislikes?.length}
                      likeHandler={likeHandler}
                      pollId={pollId}
                      handleRef={handleRef}
                      report={report}
                      loggedIn={loggedIn}
                      isStatic={true}
                    />
                  ))}
                </>
              )}

              <Flex p="3" justify={"space-between"}>
                <NextLink href={`/Polls/${pollId}`} passHref>
                  <Link
                    fontSize={"sm"}
                    fontWeight={"semibold"}
                    color="blue.400"
                    //   as={NextLink}
                    // isExternal
                    // target="_blank"
                    // rel="noopener noreferrer"
                  >
                    {`${
                      pollType === "multiChoice"
                        ? "Click here to chat!"
                        : "See all answers and chat!"
                    }`}
                  </Link>
                </NextLink>
                <Tag
                  variant={"ghost"}
                  fontSize={"sm"}
                  fontWeight={"semibold"}
                  cursor="pointer"
                  color="blue.400"
                  onClick={close}
                >
                  {`Hide ${pollType === "multiChoice" ? "Answers" : "Answer"}`}
                </Tag>
              </Flex>
            </>
          )}
        </>
      )}
    </Box>
  );
}

export default AnswerSection;
