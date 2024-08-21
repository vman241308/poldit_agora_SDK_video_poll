import { Box, Center, Flex, IconButton, Text, Tooltip } from "@chakra-ui/react";
import React, { useRef } from "react";
import { RiCloseFill } from "react-icons/ri";
import { IUserPresence } from "_components/hooks/channel/useChannel";
import { CloseBtn_custom } from "_components/pageComponents/Other/Button/miscButtons";
import { UserAvatar } from "_components/pageComponents/Poll/ChatBox/chatvideoComps";
import { IMemberVideoProps } from "../../video";
import styles from "./video.module.css";
import VideoControls from "./VideoControls";

const StreamPlayer = (props: IMemberVideoProps) => {
  const playerRef = useRef<HTMLDivElement | null>(null);

  return (
    <Box
      // flexDir={"column"}
      ref={playerRef}
      id={props.member.uid}
      className={`${styles.videoPlayer}`}
      // id={props.member.agoraId ?? props.member.uid}
      // className={
      //   props.isSingleMember
      //     ? `${styles.singlePlayer}`
      //     : `${styles.videoPlayer}`
      // }
      zIndex={1}
    >
      {props.isCreator && !props.isHost && (
        <Box position="absolute" top="2" right="2" zIndex={3}>
          <Tooltip
            label="Remove Panelist"
            placement="left-start"
            hasArrow
            rounded={"md"}
          >
            <IconButton
              aria-label="Call Sage"
              size={"sm"}
              fontSize={"xl"}
              rounded="md"
              bg="blackAlpha.400"
              variant={"ghost"}
              icon={<RiCloseFill />}
              onClick={() =>
                props.publish("Remove User", {
                  ...props.member,
                  isStreaming: false,
                  isScreenSharing: false,
                  onPanel: false,
                  showCam: false,
                  muteMic: false,
                })
              }
            />
          </Tooltip>
        </Box>
      )}

      {props.isHost && props.member.isScreenSharing && (
        <Center position="absolute" zIndex={3} h="100%" w="100%">
          <Text
            fontSize={{ base: "sm", md: "md", lg: "lg" }}
            p="2"
            bg="blackAlpha.600"
            rounded="md"
          >
            You are sharing your screen
          </Text>
        </Center>
        // <Center
        //   position="absolute"
        //   top="80%"
        //   left="30%"
        //   border="1px solid red"
        //   zIndex={10}
        //   bg="blackAlpha.600"
        //   rounded="md"
        //   p="2"
        // >
        //   <Text fontSize={{ base: "sm", md: "md", lg: "lg" }}>
        //     You are sharing your screen
        //   </Text>
        // </Center>
      )}

      {/* <video
        ref={videoRef}
        src={""}
        // height={"100%"}
        // width={"100%"}
      /> */}
      <VideoScreen {...props} />
      <VideoControls
        player={playerRef.current as HTMLElement}
        data={props.member}
        isHost={props.isHost}
      />
    </Box>
  );
};

export default StreamPlayer;

const VideoScreen = (props: IMemberVideoProps) => {
  switch (true) {
    case props.member.showCam && !props.member.isScreenSharing:
    case !props.member.showCam && props.member.isScreenSharing:
    case props.member.showCam && props.member.isScreenSharing:
      return (
        <Center
          position="absolute"
          top="2"
          left="3"
          display="flex"
          flexDir={"column"}
          zIndex={2}
        >
          <Box position="relative">
            <Box id={`${props.member.uid}_mini_video`} />
            <UserAvatar
              data={{ creator: { ...props.member } }}
              size={props.isMobile ? "lg" : "xl"}
            />
          </Box>

          <Text
            bg="blackAlpha.600"
            p="0.5"
            textAlign={"center"}
            rounded="md"
            mt="1"
            fontSize={"sm"}
          >
            {props.member.appid}
          </Text>
        </Center>
      );

    default:
      return (
        <Flex
          flexDir={"column"}
          alignItems="center"
          justifyContent={"center"}
          position="absolute"
          bg="gray.700"
          h="100%"
          w="100%"
          zIndex={2}
        >
          <UserAvatar data={{ creator: { ...props.member } }} size="lg" />
          <Text mt="3" fontWeight={"semibold"} fontSize="lg">
            {props.member.appid}
          </Text>
        </Flex>
      );
  }
};
