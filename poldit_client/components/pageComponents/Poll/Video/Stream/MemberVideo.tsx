import { Center, Flex, Text, Box } from "@chakra-ui/react";
import { RefObject, useEffect, useLayoutEffect } from "react";
import { CloseBtn_custom } from "_components/pageComponents/Other/Button/miscButtons";
import { UserAvatar } from "../../ChatBox/chatvideoComps";
import { IMemberVideoProps } from "../video";
import IconOverlay from "./IconOverlay";
import StreamPlayer from "./StreamVideo.tsx";
import styles from "./vidStyles.module.css";

interface IVidCtr extends IMemberVideoProps {
  videoRef: RefObject<HTMLDivElement>;
  videoWidth: number;
  numMembers: number;
}

const MemberVideo = ({
  videoRef,
  videoWidth,
  numMembers,
  ...props
}: IVidCtr) => {
  useLayoutEffect(() => {
    const adjustObjectFit = () => {
      const videoPlayerElements = document.querySelectorAll<HTMLDivElement>(
        ".agora_video_player"
      );

      videoPlayerElements.forEach((element) => {
        switch (true) {
          case videoWidth < 1300 && videoWidth > 700 && numMembers >= 2:
          // case videoWidth < 1300 && videoWidth > 700 && numMembers === 2:
            element.style.objectFit = "cover";
            break;
          case videoWidth < 700 && videoWidth > 400:
            element.style.objectFit = "cover";
            break;
          // case videoWidth < 700 && numMembers === 2:
          //   element.style.objectFit = "contain";
          //   break;
          default:
            element.style.objectFit = "contain";
            break;
        }
        // if (videoWidth < 1400 && videoWidth > 700) {
        //   element.style.objectFit = "cover";
        // } else {
        //   element.style.objectFit = "contain";
        // }
      });
    };

    adjustObjectFit();
  }, [videoWidth]);
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (videoRef.current) {
  //       setVideoWidth(videoRef.current.offsetWidth);
  //     }
  //   };

  //   window.addEventListener("resize", handleResize);
  //   handleResize();

  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, []);

  return (
    <Center
      h="100%"
      w="100%"
      border="1px"
      borderColor="whiteAlpha.400"
      rounded="md"
      position="relative"
      zIndex={0}
      overflow="hidden"
      ref={videoRef}
    >
      <StreamPlayer {...props} />
    </Center>
  );
};

export default MemberVideo;
