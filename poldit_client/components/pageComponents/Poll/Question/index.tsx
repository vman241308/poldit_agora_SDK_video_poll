import { PollHistory } from "../../../appTypes/appType";
import {
  Avatar,
  Box,
  Flex,
  HStack,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverTrigger,
  Tag,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@apollo/client";
import { PhotoProvider, PhotoConsumer } from "react-photo-view";
import "react-photo-view/dist/index.css";
import TimeAgo from "react-timeago";

import { BiErrorCircle, BiShareAlt } from "react-icons/bi";
import { BiDotsVerticalRounded } from "react-icons/bi";
import React, { useState } from "react";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";

import Favorite from "../PollCtrs/favorite";
import Link from "next/link";
import { useRouter } from "next/router";
import ShareBtns from "../../Other/Share";
import RichTxtOut from "_components/pageComponents/Other/RichText/RichTxtOut";
import { RawDraftContentState } from "draft-js";
import Edit from "./Edit";
import { getAuthId } from "_components/authProvider";
import PollQuestionSettings from "_components/pageComponents/Other/Settings/Question";
import MediaPreview from "_components/pageComponents/Other/Media/MediaPreview";
import { updatePoll } from "lib/apollo/apolloFunctions/mutations";
import CustomToast from "_components/pageComponents/Other/Toast";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { UserAvatar } from "../ChatBox/chatvideoComps";
import EmbedTags from "_components/pageComponents/Home/EmbedTags";

export type ReportPoll = (
  contentId: string,
  contentType: string,
  category: string
) => void;

interface PollQuestion {
  pollData: PollHistory;
  report: ReportPoll;
  question: string;
  update: (newVal: string) => void;
}

export interface EditQ {
  _id: string;
  question: string;
  pollImages: string[];
}

export type HandleEdit = (questionObj: EditQ) => void;

const PollQuestion = ({ pollData, report, question, update }: PollQuestion) => {
  //State Management
  const toast = useToast();
  const userId = getAuthId();
  const router = useRouter();
  // const toast = useToast();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [showCard, setShowCard] = useState<boolean>(false);

  //Graph API
  const { UPDATE_POLL, HANDLE_FAVORITE, REMOVE_IMAGE } =
    GraphResolvers.mutations;
  const { LAST_ACTIVITY, IS_FAVORITE } = GraphResolvers.queries;

  const [editPoll] = useMutation(UPDATE_POLL);
  const { data } = useQuery(LAST_ACTIVITY, {
    variables: { pollId: pollData._id },
  });

  //Functions
  const handleToggle = () => setShowCard(!showCard);

  const handleEditPoll = async (questionObj: EditQ) => {
    try {
      await updatePoll(editPoll, JSON.stringify(questionObj));
      toast({
        id: "pollUpdated",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Poll question updated successfully"}
            bg={"green.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={IoCheckmarkCircleOutline}
          />
        ),
      });

      update(questionObj.question);

      onClose();
    } catch (err: any) {
      if (
        err.message ===
        "Content contains inappropriate language.  Please update and resubmit."
      ) {
        toast({
          id: "editLangError",
          duration: 3000,
          position: "bottom",
          render: () => (
            <CustomToast
              msg={
                "Content contains inappropriate language.  Please update and resubmit."
              }
              bg={"red.300"}
              fontColor={"white"}
              iconSize={"20px"}
              Icon={BiErrorCircle}
            />
          ),
        });
        return;
      }

      if (err.message.startsWith("This question already exists")) {
        toast({
          id: "editDupError",
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
        return;
      }

      toast({
        id: "editError",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={
              "Error! Cannot update Poll Question.  Please refresh page and try to edit again."
            }
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });
    }
  };

  const srch_polls_by_topic_sTopic = (data: any) => {
    router.push(
      { pathname: "/Topics", query: { data: JSON.stringify(data) } },
      "/Topics"
    );
  };

  return (
    // <Box py="5" px={[4, 4, 24, 24, 40]}>
    <Box
      bg="white"
      boxShadow="0 1px 10px -1px rgba(0,0,0,.2)"
      borderRadius="lg"
      // maxW="50vw"
      // pl="6"
      // pr="2"
      pt="4"
      pb="4"
    >
      <Box pl="6" pr="2">
        <PollCardHeader
          creator={pollData?.creator}
          creationDate={pollData?.creationDate}
          onOpen={onOpen}
          isEditable={pollData?.isEditable}
          isMyPoll={pollData?.isMyPoll}
          pollId={pollData?._id}
          isActive={pollData?.isActive}
          loggedIn={userId ? true : false}
          report={report}
        />
      </Box>
      <Box
        py="5"
        // px={[0, 2, 2]} mr={[6, 6, 8, 10, 16]}
      >
        {!isOpen ? (
          <Box>
            <RichTxtOut
              contentType="Poll Question"
              content={question}
              // content={pollData?.question}
              show={showCard}
              cardToggle={handleToggle}
              txtStyle={{ pl: "25px", pr: "25px" }}
            />
            {!showCard ? (
              <Flex mt="4" align="center" pl="25px">
                {/* <PhotoProvider> */}
                {pollData?.pollImages.map((x, idx) => (
                  <MediaPreview key={idx} media={x} />
                ))}
                {/* </PhotoProvider> */}
              </Flex>
            ) : null}
          </Box>
        ) : (
          <Edit
            data={question}
            // data={pollData.question}
            pollId={pollData._id}
            editPoll={handleEditPoll}
            onClose={onClose}
            userId={userId}
          />
        )}
      </Box>
      <Box pl="6" pr="2">
        <PollCardFooter
          lastActivity={data?.lastActivity}
          data={pollData}
          // topic={pollData?.topic}
          // subTopics={pollData?.subTopics}
          // srch={srch_polls_by_topic_sTopic}
        />
      </Box>
    </Box>
    // </Box>
  );
};
export const PollCardHeader = ({
  creator,
  creationDate,
  pollId,
  isEditable,
  isMyPoll,
  onOpen,
  isActive,
  loggedIn,
  report,
}: any) => {
  return (
    <Flex justify="space-between" alignItems={"center"}>
      <Flex>
        <Box position={"relative"}>
          <UserAvatar
            data={{
              creator: {
                appid: creator?.appid,
                firstname: creator?.firstname,
                lastname: creator?.lastname,
                profilePic: creator?.profilePic,
              },
            }}
            size="md"
          />
          {/* <Link href={`/Profile/${creator?.appid}`}>
            <Avatar
              name={`${creator?.firstname} ${creator?.lastname}`}
              src={creator?.profilePic}
              border="none"
              cursor="pointer"
              bg="gray.500"
              color="white"
            />
          </Link> */}
          {isActive && (
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
                bottom="1"
                right="3px"
              ></Box>
            </Tooltip>
          )}
        </Box>
        <Flex direction="column" justify="center" pl="4">
          <Text fontSize="xs" color="gray.500">
            by {creator?.appid}
          </Text>
          <Text fontSize="xs" color="gray.500">
            <TimeAgo date={creationDate} live={false} />
          </Text>
        </Flex>
      </Flex>
      <HStack align="start" mt="1" pr="2">
        {!isMyPoll && (
          <Favorite favId={pollId} favType="Poll" loggedIn={loggedIn} />
        )}
        <Popover placement="top">
          <PopoverTrigger>
            <IconButton
              aria-label="share"
              icon={<BiShareAlt size="22px" />}
              bg="none"
              _hover={{ bg: "none" }}
              _focus={{ outline: "none" }}
              size="xs"
            />
          </PopoverTrigger>
          <ShareBtns link={pollId} />
        </Popover>
        <PollQuestionSettings
          isEditable={isEditable}
          loggedIn={loggedIn}
          openEditor={onOpen}
          reportItem={report}
          pollId={pollId}
          creatorId={creator._id}
        />
      </HStack>
    </Flex>
  );
};

interface IPollCardFooterProps {
  lastActivity: string | undefined;
  data: PollHistory;
}

export const PollCardFooter = ({
  // topic,
  // subTopics,
  lastActivity,
  data,
}: IPollCardFooterProps) => {
  return (
    <Flex justify="space-between" wrap="wrap" gridRowGap="2" ml={[0, 0, 1]}>
      <EmbedTags data={data} />
      {/* <Flex wrap="wrap" gridGap="2">
        <Link
          href={{
            pathname: "/Topics",
            query: { id: topic?._id, tagType: "topic" },
          }}
          as={"/Topics"}
        >
          <Tag
            id="topic_tag"
            fontWeight="bold"
            color="white"
            size="sm"
            borderRadius="full"
            bg="poldit.100"
            cursor="pointer"
          >
            {topic?.topic}
          </Tag>
        </Link>
        {subTopics.map((st: any) => (
          <Link
            href={{
              pathname: "/Topics",
              query: { id: st._id, tagType: "subTopic" },
            }}
            as={"/Topics"}
            key={st._id}
          >
            <Tag
              id="subtopic_tag"
              fontWeight="bold"
              color="gray.500"
              size="sm"
              borderRadius="full"
              key={st._id}
              cursor="pointer"
            >
              {st.subTopic}
            </Tag>
          </Link>
        ))}
      </Flex> */}
      <Box mr="2">
        {lastActivity && (
          <Text fontSize="xs" color="gray.400">
            {`Last activity: `}
            <TimeAgo date={lastActivity} live={false} />
          </Text>
        )}
      </Box>
    </Flex>
  );
};

export default PollQuestion;
