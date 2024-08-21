import { Box, Flex, Stack, useDisclosure } from "@chakra-ui/react";
import React, { useState } from "react";
import MediaPreview from "_components/pageComponents/Other/Media/MediaPreview";
import RichTxtOut from "_components/pageComponents/Other/RichText/RichTxtOut";
import { PollCardFooter, PollCardHeader } from "../../Question";
import Edit from "../../Question/Edit";
import { IBrowserVideoProps } from "../video";
import VideoBody from "./VideoBody";
import VideoHead from "./VideoHead";

const BrowserVideo = (props: IBrowserVideoProps) => {
  return (
    <Stack bg="white" m="5" rounded="md">
      <VideoHead
        {...props}
        pollData={props.pollData}
        handleEdit={props.handleEdit}
        userId={props.userId}
      />
      <VideoBody
        {...props}
        pollActions={props.pollActions}
        pollData={props.pollData}
        user={props.user}
      />
      <Box pl="2" pr="2" pt="2" pb="4">
        <PollCardFooter
          lastActivity={props.pollData?.lastActivity}
          data={props.pollData}
          // topics={props.pollData?.topics}
          // topic={props.pollData?.topic}
          // subTopics={props.pollData?.subTopics}
          // srch={props.srchByTopicSTopic}
        />
      </Box>
    </Stack>
  );
};

export default BrowserVideo;
