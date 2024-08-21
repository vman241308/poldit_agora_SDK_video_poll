import { LazyQueryExecFunction, OperationVariables } from "@apollo/client";
import {
  Box,
  Button,
  Center,
  Text,
  useDisclosure,
  Flex,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { BsFillPlayFill } from "react-icons/bs";
import { IUserVideoRTCReturn } from "_components/hooks/useVideoRTC";
import {
  EditQ,
  PollCardFooter,
  PollCardHeader,
  ReportPoll,
} from "../../Question";
import Edit from "../../Question/Edit";
import VideoGrid from "../Stream";
import { IVideoPoll } from "../video";
// import { IVideoPoll, THandlePanel, TUpdatePanel } from "../video";
import { motion } from "framer-motion";
import { Types } from "ably";
import RichTxtOut from "_components/pageComponents/Other/RichText/RichTxtOut";
import MediaPreview from "_components/pageComponents/Other/Media/MediaPreview";
import NavControls from "../controls/NavControls";
import { IUserPresence } from "_components/hooks/channel/useChannel";

interface IDeskTopvideoProps extends IVideoPoll {
  onOpen: () => void;
  userId: string;
  report: ReportPoll;
  isOpen: boolean;
  showCard: boolean;
  handleToggle: () => void;
  hide: boolean;
  toggleHide: () => void;
  handleEditPoll: (question: EditQ) => void;
  onClose: () => void;
  startPoll: boolean;
  srchByTopicSTopic: (data: any) => void;
  loading: boolean;
  childPolls: any;
  getPolls: LazyQueryExecFunction<any, OperationVariables>;
  panelMembers: IUserPresence[];
  updatePanel: any;
  liveStream: any;
  adminStartPoll: () => Promise<void>;
  users: IUserPresence[];
  handlePanel: any;
  channelMssgs: Types.Message[];
  shareScreen: boolean;
}

const ChatTab = dynamic(() => import("../../ChatBox"), {
  ssr: false,
});

const QACard = dynamic(() => import("../QACard"), {
  ssr: false,
});

const UsersCard = dynamic(() => import("../UsersCard"), {
  ssr: false,
});

const DeskTopVideo = (props: IDeskTopvideoProps) => {
  const { isOpen, onToggle } = useDisclosure();
  //   const { isOpen: isChatOpen, onToggle: onChatToggle } = useDisclosure();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const onChatToggle = () => setIsChatOpen(!isChatOpen);

  const animateWidth = () => {
    if ((isChatOpen && !isOpen) || (!isChatOpen && isOpen)) {
      return "90vw";
    }
    if (isChatOpen && isOpen) {
      return "95vw";
    }

    return "80vw";
  };

  //   const {
  //     getButtonProps: chatBtnProps,
  //     getDisclosureProps: chatGetDProps,
  //     isOpen: chatOpen,
  //     onClose: chatClose,
  //   } = useDisclosure();

  //   const [hideChat, setHideChat] = useState(!chatOpen);

  return (
    <motion.div
      style={{
        display: "flex",
        backgroundColor: "white",
        borderRadius: "18px",
        borderColor: "blue",
        justifyContent: "center",
        flexDirection: "column",
      }}
      animate={{ width: animateWidth() }}
      transition={{ duration: 0.7, type: "spring" }}
    >
      <Box pl="4" pr="2" pt="4" pb="4">
        <PollCardHeader
          creator={props.pollData?.creator}
          creationDate={props.pollData?.creationDate}
          onOpen={props.onOpen}
          isEditable={props.pollData?.isEditable}
          isMyPoll={props.pollData?.isMyPoll}
          pollId={props.pollData?._id}
          isActive={props.pollData?.isActive}
          loggedIn={props.user._id ? true : false}
          report={props.report}
        />
      </Box>
      <Box pb="3">
        {props.question && !props.isOpen ? (
          <Box>
            <RichTxtOut
              contentType="Poll Question"
              content={props.question}
              // content={pollData?.question}
              show={props.showCard}
              cardToggle={props.handleToggle}
              txtStyle={{ pl: "25px", pr: "25px" }}
            />
            {!props.showCard ? (
              <Flex mt="2" align="center" pl="25px">
                {props.pollData?.pollImages.map((x, idx) => (
                  <MediaPreview key={idx} media={x} />
                ))}
              </Flex>
            ) : null}
          </Box>
        ) : (
          <Edit
            data={props.question}
            pollId={props.pollData._id}
            editPoll={props.handleEditPoll}
            onClose={props.onClose}
            userId={props.userId}
          />
        )}
      </Box>
      <motion.div
        style={{
          display: "flex",
          width: "100%",
          height: "65vh",
          backgroundColor: "#2D3748",
          color: "white",
        }}
      >
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ width: "25%", overflow: "hidden" }}
            transition={{ duration: 0.7 }}
          >
            {/* <QACard
              data={props.pollData}
              loading={props.loading}
              updatePolls={() => {}}
              broadcast={() => {}}
              isHost={false}
              fetchMore={() => {}}
              pollStarted={false}
              childPolls={props.childPolls?.childPollsForParentPoll ?? []}
              getPolls={props.getPolls}
              userId={props.user._id}
              pollId={props.pollData._id}
            /> */}
          </motion.div>
        )}
        <motion.div
          style={{
            flex: 1,
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* {props.startPoll ? (
            <VideoGrid
              panel={props.panelMembers}
              pollId={props.pollData._id}
              user={props.user}
              liveStream={props.liveStream}
              shareScreen={props.shareScreen}
              
            />
          ) : (
            <Center h="100%">
              {props.pollData.creator?._id === props.userId ? (
                <Button
                  leftIcon={<BsFillPlayFill />}
                  variant="outline"
                  color="#ff4d00"
                  borderColor="#ff4d00"
                  _hover={{ bg: "#ff4d00", color: "white" }}
                  _active={{ outline: "none" }}
                  _focus={{ outline: "none", bg: "#ff4d00", color: "white" }}
                  size="lg"
                  onClick={props.adminStartPoll}
                >
                  Start the Poll
                </Button>
              ) : (
                <Text>Please wait for host to start the poll!</Text>
              )}
            </Center>
          )} */}
          {/* <Box pb="2" pt="1">
            <NavControls
              qaOpen={isOpen}
              chatOpen={isChatOpen}
              toggleQa={onToggle}
              toggleChat={onChatToggle}
              users={props.users}
              handlePanel={props.handlePanel}
              panel={props.panelMembers}
              userId={props.userId}
              // panelMember={props.panelMembers.find(
              //   (x) => x.uid == props.userId
              // )}
              startPoll={props.startPoll}
              isCreator={props.pollData?.creator?._id === props.userId}
              channelMssgs={props.channelMssgs}
              updatePanel={props.updatePanel}
            />
          </Box> */}
        </motion.div>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ width: "25%" }}
            transition={{ duration: 0.7 }}
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
            />
          </motion.div>
        )}
      </motion.div>
      <Box pl="4" pr="2" pt="4" pb="4">
        <PollCardFooter
          lastActivity={props.pollData?.lastActivity}
          data={props.pollData}
          // topic={props.pollData?.topic}
          // subTopics={props.pollData?.subTopics}
          // srch={props.srchByTopicSTopic}
        />
      </Box>
    </motion.div>
  );
};

export default DeskTopVideo;
