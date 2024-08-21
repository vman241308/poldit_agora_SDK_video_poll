import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  Avatar,
  Box,
  Collapse,
  Flex,
  HStack,
  IconButton,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Tag,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import Link from "next/link";

import TimeAgo from "react-timeago";
import { PollHistory } from "../../appTypes/appType";
import Favorite from "../Poll/PollCtrs/favorite";
import {
  AiOutlineEye,
  AiOutlineMessage,
  AiOutlineHistory,
  AiOutlineVideoCamera,
} from "react-icons/ai";
import { BiShareAlt, BiMessage, BiSelectMultiple } from "react-icons/bi";
import { RiChat4Fill, RiChat4Line, RiFilePaper2Line } from "react-icons/ri";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import { PhotoConsumer, PhotoProvider } from "react-photo-view";
import "react-photo-view/dist/index.css";
import { numCountDisplay } from "_components/formFuncs/miscFuncs";
import ShareBtns from "../Other/Share";
import RichTxtOut from "../Other/RichText/RichTxtOut";
import Cookies from "js-cookie";
import { getAuthId } from "_components/authProvider";
import MediaPreview from "../Other/Media/MediaPreview";
import { IconType } from "react-icons/lib";
import dynamic from "next/dynamic";
import EmbedTags from "./EmbedTags";

const AnswerSection = dynamic(() => import("./AnswerSection"), {
  ssr: false,
});
// import AnswerSection from "./AnswerSection";

export interface DataWindow {
  data: PollHistory[];
  btn?: string;
  update?: (btnType: string, data: PollHistory[]) => void;
  ctrStyle?: any;
  isMobile?: boolean;
}

const DataWindow = ({ data, btn, update, ctrStyle, isMobile }: DataWindow) => {
  const userId = getAuthId();

  const [updateFavorite] = useMutation(
    GraphResolvers.mutations.HANDLE_FAVORITE
  );

  const favHandler = (favId: string) => {
    const updatedPolls = data?.map((item) => {
      if (item._id === favId) {
        updateFavorite({
          variables: {
            isFav: !item.isFavorite,
            favoriteType: "Poll",
            favoriteId: item._id,
          },
        });
        return { ...item, isFavorite: !item.isFavorite };
      }
      return item;
    });

    update && btn && update(btn, updatedPolls);
  };

  // const srch_polls_by_topic_sTopic = (data: any) => {
  //   const routerData =
  //     typeof data === "object" ? JSON.stringify(data) : (data as string);

  //   router.push({ pathname: "/Polls", query: { data: routerData } }, "/Polls");
  // };

  return (
    <Stack {...ctrStyle} spacing="6">
      {/* <Box px="2" pt="2"> */}
      {data?.map((item) => (
        <PollCard
          data={item}
          key={item._id}
          handleFav={favHandler}
          userId={userId ?? ""}
          loggedIn={userId ? true : false}
          isMobile={isMobile}
          // srch={srch_polls_by_topic_sTopic}
        />
      ))}
    </Stack>
  );
};

export default DataWindow;

interface ListItem {
  data: PollHistory;
  handleFav?: (favId: string) => void;
  userId: string;
  loggedIn: boolean;
  isMobile?: boolean;
}

const PollCard = ({
  data,
  handleFav,
  userId,
  loggedIn,
  isMobile,
}: ListItem) => {
  const [showCard, setShowCard] = useState<boolean>(false);
  const { isOpen: ansOpen, onToggle: onAnsToggle } = useDisclosure();

  const handleToggle = () => setShowCard(!showCard);
  // const pollContent = richTxt_toTxt(data.question);

  return (
    <Box>
      <Box
        bg="white"
        id={`poll_${data._id}`}
        boxShadow="0 1px 10px -1px rgba(0,0,0,.2)"
        borderRadius={isMobile ? "none" : "lg"}
        // borderRadius="lg"
        // pl="6"
        // pr="2"
        pt="4"
        pb="4"
        pl="3"
        pr="3"
      >
        <Box>
          <PollCardHeader
            creator={data?.creator}
            creationDate={data?.creationDate}
            pollId={data?._id}
            isFav={data?.isFavorite}
            handleFav={handleFav}
            lasActivity={data?.lastActivity}
            isMyPoll={data?.isMyPoll}
            isActive={data?.isActive}
            loggedIn={loggedIn}
            pollType={data.pollType}
          />
        </Box>
        <Box
          py="5"
          // px={[0, 2, 2]}
          // mr={[6, 6, 8, 10, 16]}
        >
          <RichTxtOut
            contentType="Poll Preview"
            content={data.question}
            link={`/Polls/${data?._id}`}
            show={showCard}
            cardToggle={handleToggle}
            pollId={data._id}
            txtStyle={{ color: "gray.500" }}
          />
          {!showCard ? (
            <Flex mt="4" align="center" pl="25px">
              {/* <PhotoProvider> */}
              {data?.pollImages?.map((x, idx) => (
                <MediaPreview key={idx} media={x} />
              ))}
              {/* </PhotoProvider> */}
            </Flex>
          ) : null}
          {/* {!showCard ? (
            <Flex mt="4" pl="25px">
              <PhotoProvider>
                {data?.pollImages?.map((x, id) => (
                  <PhotoConsumer src={x} key={id}>
                    <Box
                      w="100px"
                      h="100px"
                      mr="2"
                      borderRadius="md"
                      overflow="hidden"
                      borderWidth="1px"
                      borderColor="gray.300"
                    >
                      <Image
                        src={x}
                        objectFit="cover"
                        objectPosition="center center"
                        cursor="pointer"
                        h="100%"
                        w="100%"
                      />
                    </Box>
                  </PhotoConsumer>
                ))}
              </PhotoProvider>
            </Flex>
          ) : null} */}
        </Box>
        <Box>
          <PollCardFooter
            data={data}
            showSection={onAnsToggle}
            isOpen={ansOpen}
          />
          {(data?.answerCount as number) > 0 && (
            <Collapse in={!ansOpen} animateOpacity>
              <AnswerSection
                loggedIn={loggedIn}
                pollId={data._id}
                pollType={data.pollType}
                userId={userId}
                answers={data.answers}
                close={onAnsToggle}
              />
            </Collapse>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const PollCardHeader = ({
  creator,
  creationDate,
  pollId,
  isFav,
  isMyPoll,
  handleFav,
  lasActivity,
  isActive,
  loggedIn,
  pollType,
}: any) => {
  return (
    <Flex justify="space-between">
      <Flex>
        <Box position={"relative"}>
          <Link href={`/Profile/${creator?.appid}`}>
            <Avatar
              name={`${creator.firstname} ${creator.lastname}`}
              src={creator?.profilePic}
              border="none"
              cursor="pointer"
              bg="gray.500"
              color="white"
            />
          </Link>
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
        <Box mt="1px">
          <PollType
            btnStyle={{ size: "22px" }}
            btnType={pollType ?? "openEnded"}
          />
        </Box>

        {lasActivity && (
          <Popover placement="top" trigger="hover">
            <PopoverTrigger>
              <IconButton
                aria-label="last_activity"
                icon={<AiOutlineHistory size="22px" />}
                bg="none"
                size="xs"
                _hover={{ bg: "none" }}
                _focus={{ outline: "none" }}
              />
            </PopoverTrigger>
            <Portal>
              <PopoverContent _focus={{ outline: "none" }} w="100%" bg="black">
                <PopoverArrow bg="black" />
                <PopoverBody>
                  <Flex justify="flex-start" align="center">
                    <Text fontSize="sm" color="white" fontWeight={"semibold"}>
                      {"Last activity was"}{" "}
                      <TimeAgo date={lasActivity} live={false} />
                    </Text>
                  </Flex>
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </Popover>
        )}
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
      </HStack>
    </Flex>
  );
};
interface IPollCardFooterProps {
  data: PollHistory;
  showSection: () => void;
  isOpen: boolean;
}

const PollCardFooter = ({
  data,
  showSection,
  isOpen,
}: IPollCardFooterProps) => {
  const btnCommonStyle = {
    // _active: { bg: "none" },
    // _hover: { bg: "none" },
    // _focus: { outline: "none" },
    size: "18px",
    color: "#718096",
    // bg: "none",
  };

  return (
    <Flex
      justify="space-between"
      alignItems={"center"}
      pt="1"
      pb="1"
      wrap="wrap"
      gridRowGap="2"
      ml={[0, 0, 1]}
    >
      <EmbedTags data={data} />
      {/* {data.topic && (
        <Flex wrap="wrap" gridGap="2">
          <Link
            href={{
              pathname: "/Topics",
              query: { id: data.topic._id, tagType: "topic" },
            }}
            as={"/Topics"}
          >
            <Tag
              id="topic_tag"
              fontWeight="bold"
              color="gray.100"
              size="sm"
              borderRadius="full"
              bg="poldit.100"
              cursor="pointer"
            >
              {data?.topic?.topic}
            </Tag>
          </Link>
          {data?.subTopics?.map((st) => (
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
                cursor="pointer"
              >
                {st.subTopic}
              </Tag>
            </Link>
          ))}
        </Flex>
      )} */}

      <HStack spacing="3" pr="2">
        {/* <Tooltip label="Number of Views" placement="top" hasArrow> */}
        <Flex justify="center" align="center">
          <AiOutlineEye {...btnCommonStyle} />
          <Text fontSize="xs" color="gray.500" ml="1" cursor="default">
            {`${data.views && numCountDisplay(data.views)} ${
              data.views === 1 ? "View" : "Views"
            }`}
          </Text>
        </Flex>
        {/* </Tooltip> */}
        {/* <Tooltip label="Number of Chat Messages" placement="top" hasArrow> */}
        <Flex justify="center" align="center">
          <AiOutlineMessage {...btnCommonStyle} />
          <Text fontSize="xs" color="gray.500" ml="1" cursor="default">
            {`${data.chatMssgsCount && numCountDisplay(data.chatMssgsCount)} ${
              data.chatMssgsCount === 1 ? "Message" : "Messages"
            }`}
          </Text>
        </Flex>
        {/* </Tooltip> */}
        {/* <Tooltip label="Number of Answers" placement="top" hasArrow> */}
        <Flex
          justify="center"
          align="center"
          cursor={(data.answerCount as number) > 0 ? "pointer" : undefined}
        >
          {isOpen && (data.answerCount as number) > 0 ? (
            <RiChat4Line {...btnCommonStyle} onClick={showSection} />
          ) : (
            <RiChat4Fill {...btnCommonStyle} onClick={showSection} />
          )}

          <Text fontSize="xs" color="gray.500" ml="1" cursor="default">
            {`${data.answerCount && numCountDisplay(data.answerCount)} ${
              data.answerCount === 1 ? "Answer" : "Answers"
            }`}
          </Text>
        </Flex>
        {/* </Tooltip> */}
        {/* <PollType
          btnStyle={btnCommonStyle}
          btnType={data.pollType ?? "openEnded"}
        /> */}
      </HStack>
    </Flex>
  );
};

interface PollType {
  btnStyle: any;
  btnType: string;
}

export const PollType = ({ btnStyle, btnType }: PollType) => {
  let BtnIcon: IconType;
  let btnLabel: string;

  if (btnType === "multiChoice") {
    BtnIcon = BiSelectMultiple;
    btnLabel = "Multiple Choice Poll";
  } else if (btnType === "videoPoll") {
    BtnIcon = AiOutlineVideoCamera;
    btnLabel = "Video Poll";
  } else {
    BtnIcon = RiFilePaper2Line;
    btnLabel = "Standard Poll";
  }

  return (
    <Tooltip label={btnLabel} placement="top" hasArrow>
      <Flex justify="center" align="center">
        <BtnIcon {...btnStyle} />
      </Flex>
    </Tooltip>
  );
};
