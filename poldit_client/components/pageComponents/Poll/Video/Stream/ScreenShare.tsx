import {
  Center,
  Box,
  Stack,
  Circle,
  Flex,
  Text,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { IUserPresence } from "_components/hooks/channel/useChannel";
import { UserAvatar } from "../../ChatBox/chatvideoComps";
import { IMemberVideoProps } from "../video";

const ScreenShare = (props: IMemberVideoProps) => {
  return (
    <Center
      h="100%"
      id={props.member.screenAgoraId}
      rounded="md"
      position="relative"
        zIndex={0}
      overflow="hidden"
    >
      <Center
        position="absolute"
        top="2"
        left="3"
        display="flex"
        flexDir={"column"}
        zIndex={5}
      >
        <Box
          rounded="full"
          h={"96px"}
          w={"96px"}
          // border="1px solid white"
          id={props.member.agoraId ?? ""}
          position="relative"
          overflow={"hidden"}
          zIndex={2}
        >
          {!props.member.showCam && (
            <Box position="absolute" top="0">
              <UserAvatar data={{ creator: { ...props.member } }} size="xl" />
            </Box>
          )}
        </Box>

        {/* {props.member.isStreaming && props.member.showCam ? (
          <Box>Video goes here</Box>
        ) : (
          <UserAvatar data={{ creator: { ...props.member } }} size="xl" />
        )} */}
      </Center>

      <Tag
        position="absolute"
        // rounded="none"
        bg={props.member.isMod ? "poldit.100" : "green.400"}
        zIndex={5}
        variant={"solid"}
        bottom={2}
        left={2}
        size={"lg"}
      >
        <TagLabel fontSize="md">
          {props.member.isMod ? "Host" : "Panel"}
        </TagLabel>
      </Tag>
    </Center>
  );
  // return (
  //   <Center
  //     h="100%"
  //     id={props.member.screenAgoraId}
  //     rounded="md"
  //     position="relative"
  //     //   zIndex={0}
  //     overflow="hidden"
  //   >
  //     {!props.member.isScreenSharing ? (
  //       <Flex
  //         flexDir={"column"}
  //         alignItems="center"
  //         justifyContent={"center"}
  //         position="absolute"
  //         h="100%"
  //         w="100%"
  //       >
  //         <UserAvatar data={{ creator: { ...props.member } }} size="xl" />
  //         <Text mt="3" fontWeight={"semibold"} fontSize="lg">
  //           {props.member.appid}
  //         </Text>
  //       </Flex>
  //     ) : (
  //       <Center
  //         position="absolute"
  //         top="2"
  //         left="3"
  //         display="flex"
  //         flexDir={"column"}
  //         zIndex={5}
  //       >
  //         <UserAvatar data={{ creator: { ...props.member } }} size="xl" />
  //       </Center>
  //     )}
  //     {/* {props.member.isScreenSharing && (
  //       <Stack
  //         h="100%"
  //         position="absolute"
  //         left="3"
  //         top="0"
  //         pt="5"
  //         spacing={5}
  //         zIndex={1}
  //       >
  //         {props.panel.map((x) => (
  //           <Box
  //             key={x.uid}
  //             rounded="full"
  //             h={"96px"}
  //             w={"96px"}
  //             // border="1px solid white"
  //             id={`user-share-screen-${x.agoraId}`}
  //             position="relative"
  //             overflow={"hidden"}
  //             zIndex={2}
  //           >
  //             {!x.showCam && (
  //               <Box position="absolute" top="0">
  //                 <UserAvatar data={{ creator: { ...x } }} size="xl" />
  //               </Box>
  //             )}
  //           </Box>
  //         ))}
  //       </Stack>
  //     )} */}
  //     <Tag
  //       position="absolute"
  //       // rounded="none"
  //       bg={props.member.isMod ? "poldit.100" : "green.400"}
  //       zIndex={5}
  //       variant={"solid"}
  //       bottom={2}
  //       left={2}
  //       size={"lg"}
  //     >
  //       <TagLabel fontSize="md">
  //         {props.member.isMod ? "Host" : "Panel"}
  //       </TagLabel>
  //     </Tag>
  //   </Center>
  // );
};

export default ScreenShare;
