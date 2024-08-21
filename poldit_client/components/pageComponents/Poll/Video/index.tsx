import { Box, Container, useDisclosure, useMediaQuery } from "@chakra-ui/react";
import BrowserVideo from "./Layout/Browser";
import { IVideoPoll } from "./video";
import usePollActions from "_components/hooks/usePollActions";
import { getAuthId } from "_components/authProvider";
import { useRouter } from "next/router";
// import useMsgChannel from "_components/hooks/channel/useMsgChannel_old";
import MsgModal from "./MsgModal";
import AppMssg from "_components/pageComponents/Other/AppMssgs";
import useMsgChannel from "_components/hooks/channel/useMsgChannel";

const VideoPoll = (props: IVideoPoll) => {
  const userId = getAuthId();
  const router = useRouter();

  ////////////////////State Management///////////////////////////
  const qaBtnProps = useDisclosure();
  const chatBtnProps = useDisclosure();

  ///////////////////Hooks//////////////////////////////////////////
  const { handleEditPoll, pollsActions } = usePollActions(
    props.pollData._id,
    userId,
    5
  );
  const msgChannel = useMsgChannel(
    props.pollData,
    props.user,
    userId === props.pollData.creator?._id,
    props.liveStream
  );

  //////////////////Functions////////////////////////////////////////////
  const srch_polls_by_topic_sTopic = (data: any) => {
    router.push(
      { pathname: "/Topics", query: { data: JSON.stringify(data) } },
      "/Topics"
    );
  };

  return (
    <Box>
      {!props.user ? (
        <Container
          w={"container.sm"}
          centerContent
          p="5"
          mt="10vh"
          bg="white"
          rounded="md"
          h="100%"
          border="1px solid white"
        >
          <Box w="100%" h="100%" bg="white">
            <AppMssg
              msg="Please register or log in to view this video poll.  You can also see who's online, join the video, chat with the community, and ask questions."
              msgType="warning"
              route="/Login"
            />
          </Box>
        </Container>
      ) : (
        <BrowserVideo
          {...props}
          handleEdit={handleEditPoll}
          userId={userId}
          srchByTopicSTopic={srch_polls_by_topic_sTopic}
          pollActions={pollsActions}
          msgChannel={msgChannel}
          qaProps={qaBtnProps}
          chatProps={chatBtnProps}
        />
      )}
      {props.pollData.creator && (
        <MsgModal
          // handler={msgChannel.modalContent?.handler}
          handler={msgChannel.handleMemberInvite}
          isOpen={msgChannel.msgModalProps.isOpen}
          onClose={msgChannel.msgModalProps.onClose}
          user={props.pollData.creator}
          // title={msgChannel.modalContent?.title ?? ""}
          // mssg={msgChannel.modalContent?.mssg ?? ""}
          title={`${props.pollData.creator.appid} has invited you to join the panel`}
          mssg={`If you accept the invite, you can share your screen or be a part of the live discussion!`}
        />
      )}
    </Box>
  );
};

export default VideoPoll;
