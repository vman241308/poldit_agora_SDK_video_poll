import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Box,
  Center,
  Container,
  HStack,
  IconButton,
  useDisclosure,
  useToast,
  Text,
  Button,
  useMediaQuery,
} from "@chakra-ui/react";
import { Types } from "ably";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAuthId } from "_components/authProvider";
import { IVideoPoll } from "./video";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";
import { configureAbly, useChannel, usePresence } from "@ably-labs/react-hooks";
import { getToasts } from "_components/pageComponents/Other/Toast/toastTypes";
import { getUniqueObjsList } from "_components/globalFuncs";
import { updatePoll } from "lib/apollo/apolloFunctions/mutations";
import { EditQ, PollCardFooter, PollCardHeader } from "../Question";
import dynamic from "next/dynamic";
import { Answer, PollHistory, User } from "_components/appTypes/appType";
import {
  BsFillChatSquareDotsFill,
  BsFillPlayFill,
  BsFillQuestionSquareFill,
} from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import Edit from "../Question/Edit";
import Drawer from "_components/pageComponents/Other/Collapse/Drawer";
import { numCountDisplay } from "_components/formFuncs/miscFuncs";
import { v4 as uuidv4 } from "uuid";
import VideoGrid from "./Stream";
import useVideoStream from "_components/hooks/useVideoStream";
import useVideoRTC from "_components/hooks/useVideoRTC";
import { enterPoll, leavePoll, updatePresenceMembers } from "./ablyFuncs";
import MobileVideo from "./Layout/Mobile";
import DeskTopVideo from "./Layout/Desktop";
import AppMssg from "_components/pageComponents/Other/AppMssgs";
import useScreenShare from "_components/hooks/useScreenShare";
import MsgModal from "./MsgModal";
import { IUserPresence } from "_components/hooks/channel/useChannel";

let isDev =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? true
    : false;

configureAbly({
  key: isDev
    ? process.env.NEXT_PUBLIC_ABLY_KEY_DEV
    : process.env.NEXT_PUBLIC_ABLY_KEY,
  clientId: uuidv4(),
});

const errList = [
  "This question already exists",
  "Content contains inappropriate language.  Please update and resubmit.",
];

const ChatTab = dynamic(() => import("../ChatBox"), {
  ssr: false,
});

const QACard = dynamic(() => import("./QACard"), {
  ssr: false,
});

const UsersCard = dynamic(() => import("./UsersCard"), {
  ssr: false,
});

const VideoPoll = (props: IVideoPoll) => {
  const { onOpen, onClose, isOpen } = useDisclosure();

  const {
    isOpen: callModalOpen,
    onOpen: onCallModalOpen,
    onClose: onCallModalClose,
  } = useDisclosure();

  const {
    isOpen: shareScreenOpen,
    onOpen: onShareScreenOpen,
    onClose: onShareScreenClose,
  } = useDisclosure();

  const userId = getAuthId();
  const router = useRouter();
  const toast = useToast();
  const [isMobile] = useMediaQuery("(max-width: 1000px)");

  /////////////////////////State Management/////////////////////////////////////////////
  const [showCard, setShowCard] = useState<boolean>(false);
  const [hide, setHide] = useState<boolean>(false);
  // const [shareScreen, setShareScreen] = useState(false);
  const [startPoll, setStartPoll] = useState(false);
  const [panelMembers, setPanelMembers] = useState<IUserPresence[]>([]);
  const [channelMssgs, setChannelMssgs] = useState<Types.Message[]>([]);
  const [userShareScreen, setUserShareScreen] = useState<
    IUserPresence | undefined
  >(undefined);

  ///////////////////DB CRUD GRAPHQL////////////////////////////////////////////////////////
  const [editPoll] = useMutation(GraphResolvers.mutations.UPDATE_POLL);

  const [getPolls, { loading, data, subscribeToMore }] = useLazyQuery(
    GraphResolvers.queries.CHILD_POLLS_FOR_PARENT,
    {
      fetchPolicy: "network-only",
    }
  );

  ///////////////////Agora UseHook////////////////////////////////////////////////////////////

  // const liveStream = useVideoRTC(
  //   `${props.pollData._id}_${props.user?.appid}`,
  //   props.user,
  //   userId === props.pollData.creator?._id
  // );

  // const handleAgoraMssgs = async (msg: string, user: IUserPresence) => {
  //   console.log(user);

  //   // channel.publish("Agora Handler", {});
  // };

  const updatePanel = (mssg: string, user: IUserPresence) => {
    channel.publish(mssg, user);
  };

  const liveStream = useVideoRTC(
    props.pollData._id,
    // `${props.pollData._id}_${props.user?.appid}`,
    userId === props.pollData.creator?._id
  );

  const screenShare = useScreenShare(
    `${props.pollData._id}_screen`,
    "videoCtr",
    userId === props.pollData.creator?._id,
    updatePanel
  );

  ////////////////////ABLY REAL TIME//////////////////////////////////////////////////////////
  const [presenceData, updateStatus] = usePresence<IUserPresence>(
    props.pollData?._id,
    {
      uid: props.user?._id,
      appid: props.user?.appid,
      profilePic: props.user?.profilePic,
      firstname: props.user?.firstname,
      lastname: props.user?.lastname,
      isMod: props.pollData?.creator?._id === props.user?._id,
      pollStarted: false,
      isStreaming: false,
      onPanel: false,
    },
    (presenceUpdate) => {
      handlePresenceChanges(presenceUpdate);
    }
  );

  const [channel] = useChannel(props.pollData._id, (mssg) => {
    handleChannelMssgs(mssg);
    setChannelMssgs((prev) => [...prev, mssg]);
  });

  ////////////////////////Functions///////////////////////////////////////////////////////////

  const adminStartPoll = async () => {
    const { appid, firstname, lastname, profilePic, _id } = props.pollData
      .creator as User;
    const host: IUserPresence = {
      appid,
      firstname,
      lastname,
      profilePic,
      isMod: true,
      onPanel: true,
      uid: _id,
      pollStarted: true,
      isStreaming: false,
      agoraId: liveStream.getAgoraUID() ?? "",
    };
    channel.publish("Poll Started", host);
    updateStatus(host);
  };

  const srch_polls_by_topic_sTopic = (data: any) => {
    router.push(
      { pathname: "/Topics", query: { data: JSON.stringify(data) } },
      "/Topics"
    );
  };

  const handlePresenceChanges = (presence: Types.PresenceMessage) => {
    switch (presence.action) {
      case "enter":
        // props.pollData.creator?._id !== presence.data.uid &&
        //   userId === presence.data.uid &&
        //   enterPoll(
        //     channel,
        //     props.pollData.creator?._id as string,
        //     handleStartPollInProgress,
        //     liveStream,
        //     props.pollData._id
        //   );
        break;
      case "leave":
        removePanelMember(presence.data);
        break;
      default:
        break;
    }
  };

  const handleStartPollInProgress = async () => {
    channel.presence.get(async (err, members) => {
      const host = members?.find(
        (x) => x.data.uid === (props.pollData.creator?._id as string)
      );
      if (host && host.data.pollStarted) {
        setStartPoll(true);
        const panelists = members
          ?.map((x) => x.data)
          .filter((y: IUserPresence) => y.onPanel)
          .sort((a: any, b: any) => b.isMod - a.isMod);

        if (panelists) {
          await liveStream.initChannel(false);
          setPanelMembers(panelists);
        }
      }
    });
  };

  const handleChannelMssgs = (mssg: Types.Message) => {
    switch (mssg.name) {
      case "Poll Started":
        handleStartPoll(mssg.data);
        break;
      case "User Invited":
        mssg.data.appid === props.user?.appid && togglePanelModal(mssg.data);
        break;
      case "User Removed":
        removePanelMember(mssg.data);
        break;
      case "User Accepted":
        panelAcceptInvite(mssg.data);
        break;
      case "User Declined":
        props.user?.appid === props.pollData.creator?.appid &&
          panelDeclineInvite(mssg.data);
        break;
      case "Host Camera":
        handleHostCamera(mssg.data);
        break;

      case "Share Screen":
        handleScreenShare(mssg.data);
        break;
      case "Panel Share Screen":
        props.pollData?.creator?._id === props.user?._id &&
          toggleScreenShareModal(mssg.data);
        break;
      case "Accepted Screen Share":
        acceptScreenShareInvite(mssg.data);
        break;
      case "Declined Screen Share":
        props.user._id === mssg.data.uid && declineScreenShareInvite();
        break;
      case "Screen Share Cancelled":
        handleScreenShareToasts(
          mssg.data,
          `${mssg.data.appid} decided not to share their screen.`
        );
        break;
      case "Screen Share Toggle":
        handleScreenShareToasts(mssg.data);
        break;
      case "Host Mic":
        handleHostAudio(mssg.data);
        break;
      case "Start Stream":
        handleStartStream(mssg.data);
        break;
      case "Stop Stream":
        handleStopStream(mssg.data);
        break;
      case "Leave Stream":
        removePanelMember(mssg.data);
        break;
    }
  };

  const handleScreenShareInvite = (answer: boolean) => {
    const channelMssg = !answer
      ? "Declined Screen Share"
      : "Accepted Screen Share";

    if (userShareScreen) {
      channel.publish(channelMssg, {
        ...userShareScreen,
        isScreenSharing: answer,
      });
    }
    onShareScreenClose();
  };

  const acceptScreenShareInvite = async (user: IUserPresence) => {
    await handleScreenShare(user);
    // updatePresenceMembers(channel, user, "isScreenSharing", false);
    userId === user.uid &&
      getToasts(toast, "success", {
        id: "userAccepted",
        duration: 3000,
        iconSize: "20px",
        msg: `The moderator has accepted your request to share your screen.`,
        position: "bottom",
      });
  };

  const declineScreenShareInvite = () => {
    return getToasts(toast, "error", {
      id: "userDeclined",
      duration: 3000,
      iconSize: "20px",
      msg: `The moderator has declined your request to share your screen.`,
      position: "bottom",
    });
  };

  const handleScreenShare = async (user: IUserPresence) => {
    const { handleScreenShare, handleShare } = screenShare;
    const { startStream, getAgoraUID } = liveStream;
    const isSharingScreen = user.isScreenSharing as boolean;

    userId === user.uid && handleShare(isSharingScreen);

    // handleShare(isSharingScreen);
    await handleScreenShare(
      `${props.pollData._id}_screen`,
      userId === user.uid,
      isSharingScreen,
      user
    );

    if (userId === user.uid && !user.isScreenSharing && user.isStreaming) {
      await startStream(user, props.pollData._id, userId === user.uid);
    }

    if (user.uid === userId) {
      updateStatus(user);
    }
    setPanelMembers((prev) =>
      prev.map((x) =>
        x.uid === user.uid ? user : { ...x, isScreenSharing: false }
      )
    );
  };

  const handleScreenShareToasts = (user: IUserPresence, msg?: string) => {
    if (msg && userId !== user.uid) {
      getToasts(toast, "warning", {
        id: "userScreenShareDenied",
        duration: 3000,
        iconSize: "20px",
        msg,
        position: "bottom",
      });
      return;
    }

    screenShare.handleShare(user.isScreenSharing as boolean);
    if (user.isScreenSharing && userId !== user.uid) {
      getToasts(toast, "success", {
        id: "userScreenShareSuccess",
        duration: 3000,
        iconSize: "20px",
        msg: `${user.appid} is now sharing their screen`,
        position: "bottom",
      });
      return;
    }
    if (!user.isScreenSharing && userId !== user.uid) {
      getToasts(toast, "error", {
        id: "userScreenShareStop",
        duration: 3000,
        iconSize: "20px",
        msg: `${user.appid} is no longer sharing their screen`,
        position: "bottom",
      });
    }
  };

  const handleHostCamera = async (user: IUserPresence) => {
    updatePanelMember(user, "showCam", user.showCam as boolean);
    if (user.uid === userId) {
      liveStream.toggleCamera();
      updateStatus(user);
    }
  };

  const handleHostAudio = async (user: IUserPresence) => {
    updatePanelMember(user, "muteMic", user.muteMic as boolean);
    if (user.uid === userId) {
      liveStream.toggleMic();
      updateStatus(user);
    }
  };

  const handleStartStream = async (user: IUserPresence) => {
    const { startStream, getAgoraUID } = liveStream;
    let updatedUser: IUserPresence = user;
    await startStream(user, props.pollData._id, userId === user.uid);
    if (user.uid === userId) {
      const agoraId = getAgoraUID() ?? "";
      updatedUser = { ...user, agoraId };
      updateStatus(updatedUser);
    }
    setPanelMembers((prev) =>
      prev.map((x) => (x.uid === user.uid ? updatedUser : x))
    );
  };

  const handleStopStream = (user: IUserPresence) => {
    user.uid === userId && updateStatus(user);
    updatePanelMember(user, "isStreaming", false);
  };

  const handleStartPoll = (panelMember: IUserPresence) => {
    setStartPoll(true);
    setPanelMembers([panelMember]);
  };

  const togglePanelModal = (data: IUserPresence) => {
    data.onPanel && onCallModalOpen();
  };

  const toggleScreenShareModal = (data: IUserPresence) => {
    setUserShareScreen(data);
    onShareScreenOpen();
  };

  // const handlePanel: THandlePanel = (panelMember, onPanel) => {
  //   const channelMssg = onPanel ? "User Invited" : "User Removed";
  //   channel.publish(channelMssg, {
  //     ...panelMember,
  //     onPanel,
  //   });
  // };

  const panelDeclineInvite = (user: IUserPresence) => {
    return getToasts(toast, "error", {
      id: "userDeclined",
      duration: 3000,
      iconSize: "20px",
      msg: `${user.appid} declined the invite.`,
      position: "bottom",
    });
  };

  const panelAcceptInvite = async (user: IUserPresence) => {
    const { initChannel, getAgoraUID } = liveStream;
    await initChannel(true);
    let updatedUser: IUserPresence = user;
    if (user.uid === userId) {
      const agoraId = getAgoraUID() ?? "";
      updatedUser = { ...user, agoraId };
      updateStatus(updatedUser);
    }

    setPanelMembers((prev) =>
      getUniqueObjsList([...prev, updatedUser], "appid")
    );
  };

  const updatePanelMember = (
    user: IUserPresence,
    key: string,
    val: boolean
  ) => {
    setPanelMembers((prev) => {
      return prev.map((x) => (x.uid === user.uid ? { ...x, [key]: val } : x));
    });
  };

  const removePanelMember = (user: IUserPresence) => {
    const { muteMic, showCam, ...rest } = user;
    if (user.uid === userId) {
      user.uid === props.pollData.creator?._id
        ? updateStatus({
            ...rest,
            isStreaming: false,
            onPanel: false,
            pollStarted: false,
          })
        : updateStatus({ ...rest, isStreaming: false, onPanel: false });
      liveStream.leaveStream();
    }
    user.agoraId && liveStream.unsubscribeStream(user.agoraId);
    setPanelMembers((prev) => prev.filter((x) => x.appid !== user.appid));
  };

  const handleMemberInvite = (answer: boolean) => {
    const userPresense = presenceData.find(
      (x) => x.data.appid === props.user?.appid
    );
    const channelMssg = !answer ? "User Declined" : "User Accepted";
    if (userPresense) {
      channel.publish(channelMssg, { ...userPresense.data, onPanel: answer });
    }

    onCallModalClose();
  };

  const toggleHide = () => setHide(!hide);

  const handleToggle = () => setShowCard(!showCard);

  const handleEditPoll = async (questionObj: EditQ) => {
    try {
      await updatePoll(editPoll, JSON.stringify(questionObj));
      getToasts(toast, "success", {
        id: "pollUpdated",
        duration: 2000,
        iconSize: "20px",
        msg: "Poll Updated!",
        position: "bottom",
      }),
        props.update(questionObj.question);

      onClose();
    } catch (err: any) {
      const errMssg = err.message as string;

      const displayMssg = errList.includes(errMssg)
        ? errMssg
        : "Oops!  Something went wrong.  Please refresh the page and try again.";

      getToasts(toast, "error", {
        id: "editQuestionError",
        duration: 2000,
        iconSize: "20px",
        msg: displayMssg,
        position: "bottom",
      });
    }
  };

  ///////////////// On Page Mount///////////////////////////////////////////////////////////
  useEffect(() => {
    subscribeToMore({
      document: GraphResolvers.subscriptions.QUESTION_SUBSCRIPTION,
      variables: { parentId: props.pollData._id },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        let newItem = {
          ...subscriptionData.data.newQuestion,
        };

        if (userId === newItem.creator._id) {
          newItem = {
            ...newItem,
            isEditable: true,
            isRemoveable: true,
          };
          const matchIdx: number = prev?.childPollsForParentPoll.findIndex(
            (item: Answer) => item._id === newItem._id
          );

          if (matchIdx > -1) {
            let updatedPolls: PollHistory[] = [];

            if (newItem.isRemoved) {
              //Answer is being removed
              updatedPolls = prev.childPollsForParentPoll.filter(
                (item: PollHistory) => item._id !== newItem._id
              );
            } else {
              //Question already exists.  This is for likes and dislikes count update without adding new question
              updatedPolls = prev.childPollsForParentPoll.map(
                (item: PollHistory, idx: number) => {
                  if (idx === matchIdx) {
                    return newItem;
                  } else return item;
                }
              );
            }

            if (newItem.parentPollId._id === props.pollData._id) {
              return Object.assign({}, prev, {
                childPollsForParentPoll: updatedPolls,
              });
            }

            return prev;
          }

          if (newItem.parentPollId._id === props.pollData._id) {
            return Object.assign({}, prev, {
              childPollsForParentPoll: [
                newItem,
                ...prev.childPollsForParentPoll,
              ],
            });
          }
          return prev;
        }
      },
    });
  }, []);

  useEffect(() => {
    liveStream.clientReady && handleStartPollInProgress();
  }, [liveStream.clientReady]);

  return (
    <Center>
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
        <>
          {isMobile ? (
            <MobileVideo />
          ) : (
            <DeskTopVideo
              {...props}
              onOpen={onOpen}
              userId={userId}
              isOpen={isOpen}
              showCard={showCard}
              handleToggle={handleToggle}
              hide={hide}
              toggleHide={toggleHide}
              handleEditPoll={handleEditPoll}
              onClose={onClose}
              startPoll={startPoll}
              srchByTopicSTopic={srch_polls_by_topic_sTopic}
              loading={loading}
              childPolls={data}
              getPolls={getPolls}
              panelMembers={panelMembers}
              updatePanel={updatePanel}
              liveStream={liveStream}
              adminStartPoll={adminStartPoll}
              users={presenceData
                .map((x) => x.data)
                .sort((x: any, y: any) => y.isMod - x.isMod)}
              handlePanel={() => {}}
              // handlePanel={handlePanel}
              channelMssgs={channelMssgs}
              shareScreen={screenShare.shareScreen}
            />
          )}
          {props.pollData.creator && (
            <MsgModal
              handler={handleMemberInvite}
              isOpen={callModalOpen}
              onClose={onCallModalClose}
              user={props.pollData.creator}
              title={`${props.pollData.creator.appid} has invited you to join the panel`}
              mssg={`If you accept the invite, you can share your screen or be a part of the live discussion!`}
            />
          )}
          {userShareScreen && (
            <MsgModal
              handler={handleScreenShareInvite}
              isOpen={shareScreenOpen}
              onClose={onShareScreenClose}
              user={userShareScreen as IUserPresence}
              title={`${userShareScreen.appid} is trying to share their screen.`}
              mssg={`If you accept, ${userShareScreen.appid}'s screen will replace any screen currently being shared.`}
            />
          )}
        </>
      )}
    </Center>
  );
};

export default VideoPoll;
