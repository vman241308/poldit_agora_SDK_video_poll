import { Box, Grid, SimpleGrid, useMediaQuery } from "@chakra-ui/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { IVideoGridProps } from "../video";
import BroadcastCtr from "./BroadcastCtr";
import MemberVideo from "./MemberVideo";

const VideoGrid = (props: IVideoGridProps) => {
  const isSingleMember = props.panel.length === 1;
  const [isMobile] = useMediaQuery("(max-width: 1800px)");
  const [videoWidth, setVideoWidth] = useState(0);
  const videoRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (videoRef.current) {
        setVideoWidth(videoRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const columns = props.panel.length <= 2 ? props.panel.length : 2;


  return (
    <Box h="100%" position="relative">
      <Grid
        h="100%"
        p="3"
        templateColumns={{ base: "1fr", md: `repeat(${columns}, 1fr)` }}
        gap={4}
      >
        {props.panel.map((x) => (
          <MemberVideo
            // boxHeight={boxHeight}
            key={x.uid}
            member={x}
            user={props.user}
            isHost={props.user?._id === x.uid}
            isCreator={props.user._id === props.creator?._id}
            liveStream={props.msgChannel.liveStream}
            publish={props.msgChannel.publishToChannel}
            isSingleMember={isSingleMember && !props.isSideOpen}
            isMobile={isMobile}
            videoRef={videoRef}
            videoWidth={videoWidth}
            numMembers={props.panel.length}
          />
        ))}
      </Grid>
      {/* <SimpleGrid
        justifyContent={"center"}
        minChildWidth="400px"
        h="100%"
        p="3"
        spacing={2}
      >
        {props.panel.map((x) => (
          <MemberVideo
            // boxHeight={boxHeight}
            key={x.uid}
            member={x}
            user={props.user}
            isHost={props.user?._id === x.uid}
            isCreator={props.user._id === props.creator?._id}
            liveStream={props.msgChannel.liveStream}
            publish={props.msgChannel.publishToChannel}
            isSingleMember={isSingleMember && !props.isSideOpen}
            isMobile={isMobile}
          />
        ))}
      </SimpleGrid> */}
      {props.msgChannel.broadCastData && (
        <BroadcastCtr
          isHost={props.creator?._id === props.user._id}
          bData={props.msgChannel.broadCastData}
          broadcast={props.msgChannel.publishToChannel}
          update={props.pollActions.updatePolls}
        />
      )}
    </Box>
  );
};

export default VideoGrid;
