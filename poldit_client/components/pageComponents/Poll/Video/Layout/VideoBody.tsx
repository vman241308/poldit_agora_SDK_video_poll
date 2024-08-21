import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { IBrowserVideoProps, IVideoBodyProps, THandlePanels } from "../video";
import { motion } from "framer-motion";
import VideoGrid from "../Stream";
import { BsFillPlayFill } from "react-icons/bs";
import NavControls from "../controls/NavControls";
import BroadcastCtr from "../Stream/BroadcastCtr";
import ThreeDotsLoading from "_components/pageComponents/Other/Loading/threeDots";
import ErrorCard from "_components/pageComponents/Error/errorCard";

const ChatTab = dynamic(() => import("../../ChatBox"), {
  ssr: false,
});

const QACard = dynamic(() => import("../QACard"), {
  ssr: false,
});

const VideoBody = (props: IBrowserVideoProps) => {
  return (
    <Box bg="gray.700" color="white" h="65vh" w="100%">
      <Flex h="100%">
        <QAContainer {...props} />
        <VideoContainer {...props} />
        {/* {props.liveStream.clientReady ? (
          <VideoContainer {...props} />
        ) : (
          <Center w="100%">
            <ErrorCard
              iconSize="24px"
              msg="Oops, something went wrong!  Refresh the page and try again."
              txtSize="md"
            />
          </Center>
        )} */}
        <ChatContainer {...props} />
      </Flex>
    </Box>
  );
};

export default VideoBody;

const VideoContainer = (props: IVideoBodyProps) => {
  return (
    <motion.div
      style={{
        flex: 1,
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {props.msgChannel.startPoll ? (
        <VideoGrid
          panel={props.msgChannel.panelMembers}
          pollId={props.pollData._id}
          user={props.user}
          msgChannel={props.msgChannel}
          pollActions={props.pollActions}
          creator={props.pollData.creator}
          isSideOpen={props.qaProps.isOpen && props.chatProps.isOpen}
        />
      ) : (
        <Center h="100%">
          <>
            {props.msgChannel.endPoll ? (
              <Text w="50%" textAlign={"center"}>
                The livestream has concluded. Thank you for taking part in the
                poll. The stream will be available to replay shortly.
              </Text>
            ) : (
              <>
                {props.msgChannel.startPoll === false && (
                  <>
                    {props.pollData.creator?._id === props.userId ? (
                      <Button
                        leftIcon={<BsFillPlayFill />}
                        variant="outline"
                        color="#ff4d00"
                        isLoading={props.msgChannel.startPollLoading}
                        borderColor="#ff4d00"
                        _hover={{ bg: "#ff4d00", color: "white" }}
                        _active={{ outline: "none" }}
                        _focus={{
                          outline: "none",
                          bg: "#ff4d00",
                          color: "white",
                        }}
                        size="lg"
                        onClick={() =>
                          props.msgChannel.startPollAsAdmin("Poll Started")
                        }
                      >
                        Start the Poll
                      </Button>
                    ) : (
                      <Text>Please wait for host to start the poll!</Text>
                    )}
                  </>
                )}
              </>
            )}
          </>
        </Center>
      )}

      <Box pb="2">
        <NavControls
          qaOpen={props.qaProps.isOpen}
          chatOpen={props.chatProps.isOpen}
          toggleQa={props.qaProps.getButtonProps}
          toggleChat={props.chatProps.getButtonProps}
          msgChannel={props.msgChannel}
          userId={props.userId}
          isCreator={props.pollData?.creator?._id === props.userId}
          channelMssgs={[]}
        />
      </Box>
    </motion.div>
  );
};

interface ISidePanelProps extends IBrowserVideoProps {
  //   getDisclosureProps: (props?: any) => any;
  //   isOpen: boolean;
}

const QAContainer = (props: ISidePanelProps) => {
  const { data, getPolls, loading, updatePolls, fetchMore, error } =
    props.pollActions;
  const { isOpen, getDisclosureProps } = props.qaProps;
  const [hidden, setHidden] = useState(!isOpen);
  //   const [hidden, setHidden] = useState(!props.isOpen);

  return (
    <motion.div
      {...getDisclosureProps()}
      hidden={hidden}
      initial={false}
      //   animate={{ opacity: 1 }}
      onAnimationStart={() => setHidden(false)}
      onAnimationComplete={() => setHidden(!isOpen)}
      animate={{
        width: isOpen ? "22vw" : 0,
        minWidth: isOpen ? "320px" : 0,
      }}
      style={{
        background: "none",
        overflow: "hidden",
        whiteSpace: "nowrap",
        border: "1px solid white",
      }}
    >
      <QACard
        data={props.pollData}
        loading={loading}
        error={error}
        updatePolls={updatePolls}
        childPolls={data}
        fetchMore={fetchMore}
        // childPolls={data?.childPollsForParentPoll ?? []}
        getPolls={getPolls}
        user={props.user}
        pollId={props.pollData._id}
        isHost={props.pollData.creator?._id === props.userId}
        pollStarted={props.msgChannel.startPoll}
        broadcast={props.msgChannel.publishToChannel}
      />
    </motion.div>
  );
};

const ChatContainer = (props: ISidePanelProps) => {
  const { isOpen, getDisclosureProps } = props.chatProps;
  const [hidden, setHidden] = useState(!isOpen);
  return (
    <motion.div
      {...getDisclosureProps()}
      hidden={hidden}
      initial={false}
      //   animate={{ opacity: 1 }}
      onAnimationStart={() => setHidden(false)}
      onAnimationComplete={() => setHidden(!isOpen)}
      animate={{
        width: isOpen ? "22vw" : 0,
        minWidth: isOpen ? "320px" : 0,
      }}
      style={{
        background: "none",
        overflow: "hidden",
        whiteSpace: "nowrap",
        border: "1px solid white",
      }}
    >
      <ChatTab
        pollId={props.pollData._id}
        user={props.user}
        addAnswer={props.addAnswer}
        answerRef={props.answerRef}
        chatRef={props.chatRef}
        handleRef={props.handleRef}
        report={props.report}
        data={props.chatData}
        loading={props.chatLoading}
        error={props.chatErr}
        subscribeToMore={props.chatSubscribeToMore}
        fetchMore={props.chatFetchMore}
        videoView={true}
        publishToChannel={props.msgChannel.publishToChannel}
      />
    </motion.div>
  );
};
