import { Box, Flex, HStack, Stack, Tag, Text } from "@chakra-ui/react";
import RichTxtOut from "_components/pageComponents/Other/RichText/RichTxtOut";
import { UserAvatar } from "../ChatBox/chatvideoComps";
import { getReactionIcon, ReactBtn, ReactProps } from "./QACardComps";
import TimeAgo from "react-timeago";
import {
  BsHandThumbsDown,
  BsHandThumbsDownFill,
  BsHandThumbsUp,
  BsHandThumbsUpFill,
} from "react-icons/bs";
import { Answer } from "_components/appTypes/appType";
import { useState } from "react";
import { IconType } from "react-icons/lib";
import MultiChoiceCard from "../AnsBox/MultiChoiceCard";
import { IMultiChoiceResult } from "_components/hooks/useMultiChoice";

interface AnswerCardProps {
  data: Answer;
  userId: string;
  react: ReactProps;
  multiChoiceHook: IMultiChoiceResult;
}

const AnswerCard = (props: AnswerCardProps) => {
  const [showCard, setShowCard] = useState<boolean>(false);

  const handleToggle = () => setShowCard(!showCard);

  const LikeIcon = getReactionIcon(
    "like",
    props.data.likes.some((item) => item.userId === props.userId)
  );

  const DisLikeIcon = getReactionIcon(
    "dislike",
    props.data.dislikes.some((item) => item.userId === props.userId)
  );

  return (
    <Box color="gray.600" w="97%">
      {props.data.multichoice && props.data.multichoice.length > 0 ? (
        <MultiCard {...props} />
      ) : (
        <StandardCard
          {...props}
          showCard={showCard}
          handleToggle={handleToggle}
          LikeIcon={LikeIcon}
          DisLikeIcon={DisLikeIcon}
        />
      )}
    </Box>
  );
};

export default AnswerCard;

const MultiCard = (props: AnswerCardProps) => {
  const { multiChoiceHandler, multiError, multiLoading, myVote } =
    props.multiChoiceHook;

  return (
    <Flex
      direction="column"
      bg="white"
      borderRadius="18px 18px 0 18px"
      mr="3"
      w="100%"
      p="2"
    >
      <Text fontSize="xs" color="gray.500" p="2" pl="3">
        {props.data.creator?.appid}
      </Text>
      <Flex h="100%" flexDirection={"column"} mt="1">
        <Flex
          // h="60px"
          align="end"
          justify="center"
          alignItems={"center"}
        >
          <Text fontSize="sm" color="gray.600" fontWeight="bold" align="center">
            Select your favorite answer
          </Text>
        </Flex>
        <Stack p="2" bg="gray.200" spacing="4">
          {props.data?.multichoice?.map((x: any) => (
            <MultiChoiceCard
              data={x}
              key={x._id}
              answer={props.data}
              choose={multiChoiceHandler}
              myVote={myVote([props.data])}
              loading={multiLoading}
              style={{ p: "2" }}
            />
          ))}
        </Stack>
      </Flex>
    </Flex>
  );
};

interface IStandardCardProps extends AnswerCardProps {
  showCard: boolean;
  handleToggle: () => void;
  LikeIcon: IconType | undefined;
  DisLikeIcon: IconType | undefined;
}

const StandardCard = (props: IStandardCardProps) => (
  <HStack w="100%" spacing="2" display={"flex"} alignItems="flex-start">
    <UserAvatar data={props.data} size="sm" />
    <Flex
      direction="column"
      bg="white"
      borderRadius="18px 18px 0 18px"
      mr="3"
      w="100%"
      p="2"
    >
      <Text fontSize="xs" color="gray.500" p="2" pl="3">
        {props.data.creator?.appid}
      </Text>
      <Box mt="1">
        <RichTxtOut
          contentType="video"
          content={props.data.answer}
          fontSize={["xs", "sm", "sm", "sm"]}
          txtStyle={{ pl: "3", whiteSpace: "normal" }}
          show={props.showCard}
          cardToggle={props.handleToggle}
        />
        <Flex justifyContent={"space-between"} mt="2" mb="1">
          <HStack spacing="2">
            <ReactBtn
              icon={props.LikeIcon ?? BsHandThumbsUp}
              size="16px"
              val={"like"}
              react={props.react}
              contentId={props.data._id}
              reactionCount={props.data.likes.length ?? 0}
              styles={{
                size: "sm",
                color: "green.300",
                id: "qthumbsup",
              }}
            />
            <ReactBtn
              icon={props.DisLikeIcon ?? BsHandThumbsDown}
              val={"dislike"}
              size="16px"
              react={props.react}
              contentId={props.data._id}
              reactionCount={props.data.dislikes.length ?? 0}
              styles={{
                size: "sm",
                color: "red.300",
                id: "qthumbsdown",
              }}
            />
          </HStack>
          <Text fontSize="xs" color="gray.500" pt="2" pr="2">
            <TimeAgo date={props.data.creationDate} live={false} />
          </Text>
        </Flex>
      </Box>
    </Flex>
  </HStack>
);
