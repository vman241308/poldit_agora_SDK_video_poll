import { configureAbly, useChannel, usePresence } from "@ably-labs/react-hooks";
import { Types } from "ably";
import { v4 as uuidv4 } from "uuid";
import React, { useEffect, useState } from "react";
import { getAuthId } from "_components/authProvider";
import { useDisclosure, useToast } from "@chakra-ui/react";
import {
  IBroadCastData,
  IMediaTrack,
  IUserPresence,
  TBroadcastContent,
  TGetChannelToast,
  THandleDevice,
  THandleMessageTrigger,
  TMediaType,
  TModeratorHandler,
  TOtherChannelHandler,
  TPollMssgType,
  TPublishToChannel,
  TRemovePanelMember,
  TStartLiveStream,
  TStartPollAsAdmin,
  TUseMsgChannel,
} from "./useChannel";
import { useMutation } from "@apollo/client";
import GraphResolvers from "_apiGraphStrings/mutations";
import useLiveStream from "../media/useLiveStream";
import { getMediaToasts } from "_components/pageComponents/Other/Toast/toastTypes";
import { User } from "_components/appTypes/appType";
import { getUniqueObjsList } from "_components/globalFuncs";
import { TStreamType } from "../media/media";

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

const TOAST_TIMER = 3000;

const useMsgChannel: TUseMsgChannel = (
  channelData,
  channelUser,
  isMod,
  liveStream
) => {
  const userId = getAuthId();
  const toast = useToast();
  ///////State Management///////////////////////////////////////////////////
  const [startPoll, setStartPoll] = useState<boolean | undefined>(undefined);
  const [startPollLoading, setStartPollLoading] = useState(false);
  const [endPoll, setEndPoll] = useState(false);
  const [newChat, isNewChat] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);
  const [record, setRecord] = useState(false);
  const [recordLoading, setRecordLoading] = useState(false);
  const [mediaTracks, setMediaTracks] = useState<IMediaTrack>();
  // const [liveStreamErr, setLiveStreamErr] = useState(false);
  const [newQA, isNewQA] = useState(false);
  const msgModalProps = useDisclosure();
  const [panelMembers, setPanelMembers] = useState<IUserPresence[]>([]);
  const [channelMssgs, setChannelMssgs] = useState<Types.Message[]>([]);
  const [isNotified, setIsNotified] = useState(false);
  const [broadCastData, setBroadCastData] = useState<
    IBroadCastData | undefined
  >();
  //////Ably Channel and Channel Member Hooks//////////////////////////
  const [presenceData, updateStatus] = usePresence<IUserPresence>(
    channelData._id,
    {
      uid: channelUser?._id,
      appid: channelUser?.appid,
      profilePic: channelUser?.profilePic,
      firstname: channelUser?.firstname,
      lastname: channelUser?.lastname,
      agoraId: "",
      screenAgoraId: "",
      isMod,
      pollStarted: false,
      isStreaming: false,
      onPanel: false,
      modMuteCam: false,
      modMuteMic: false,
    },
    (presenceUpdate) => {
      handlePresenceChanges(presenceUpdate);
    }
  );

  const [channel] = useChannel(channelData._id, (mssg) => {
    handleChannelMssgs(mssg);
    setChannelMssgs((prev) => [...prev, mssg]);
  });

  const [updateVideoPoll] = useMutation(GraphResolvers.UPDATE_VIDEO_POLL);

  ///////////////Channel Mssg Handlers//////////////////////////////////
  const handlePresenceChanges = async (presence: Types.PresenceMessage) => {
    switch (presence.action) {
      case "enter":
        enterRoom(presence.data);
        break;
      case "leave":
        leaveRoom(presence.data);
        break;
      default:
        break;
    }
  };

  const handleChannelMssgs = (mssg: Types.Message) => {
    switch (mssg.name) {
      case "Poll Started":
        handleStartPoll(mssg.data);
        break;
      case "Host Back":
        getCurrentPanel(mssg.data);
        return;
      case "User Invited":
        mssg.data.uid === channelUser._id && togglePanelModal(mssg.data);
        return;
      case "User Accepted":
        panelAcceptInvite(mssg.data);
        return;
      case "User Declined":
        panelDeclineInvite(mssg.data);
        break;
      case "Decline Screen Share":
        declineScreenShare(mssg.data);
        break;

      case "Remove User":
        removePanelMember(mssg.data, "remove");
        return;
      case "Leave Stream":
        removePanelMember(mssg.data, "leave");
        return;
      case "Update Panel":
        updatePanelMember(mssg.data);
        return;
      case "Stop Share":
        mssg.data.uid === channelUser._id && updateStatus(mssg.data);
        updatePanelMember(mssg.data);
        getChannelToast(
          "success",
          `${mssg.data.appid} stopped screen sharing!`,
          mssg.data,
          TOAST_TIMER
        );
        return;
      case "Chat Message":
        handleNewMssgTrigger(mssg.data.uid, "chat");
        return;
      case "QA Message":
        handleNewMssgTrigger(mssg.data.uid, "qa");
        return;
      case "User Invite Request":
        handleInviteRequests(mssg.data);
        return;
      case "Moderator Control":
        handleModeratorControls(mssg.data);
        return;
      case "Broadcast":
        broadcastContent(mssg.data);
        return;
      default:
        mssg.data.uid !== channelUser._id &&
          getChannelToast("success", mssg.name, mssg.data, TOAST_TIMER);
        return;
    }
  };

  //Publish Mssg to Channel
  const publishToChannel: TPublishToChannel = (mssg, user) =>
    channel.publish(mssg, user);

  //Show Channel Toast Messages
  const getChannelToast: TGetChannelToast = (
    mssgType,
    mssg,
    data,
    duration,
    noId
  ) =>
    getMediaToasts(toast, mssgType, {
      duration,
      msg: mssg,
      position: "bottom",
      user: data,
      noId: noId ?? true,
    });

  /////////////////BroadCast Functions//////////////////////////////////////////
  const broadcastContent: TBroadcastContent = (data) => {
    setBroadCastData(data.remove ? undefined : data);
  };

  ///////////Video RTC Hook///////////////////////////////////////////////////
  // const liveStream = useLiveStream(channelData._id, isMod, publishToChannel);

  //////////Moderator Controls//////////////////////////////////////////////
  const handleModeratorControls: TModeratorHandler = async (user) => {
    switch (user.modMssg) {
      case "mute":
        user.panel.forEach((x) => {
          !x.isMod &&
            handleMicAudio({
              ...x,
              muteMic: !x.muteMic,
              modMuteMic: !x.modMuteMic,
            });
        });
        break;
      case "video":
        user.panel.forEach((x) => {
          !x.isMod &&
            handleHostCamera({
              ...x,
              showCam: !x.showCam,
              modMuteCam: !x.modMuteCam,
            });
        });
        break;
      case "remove_panel":
        user.panel.forEach((x) => {
          !x.isMod &&
            x.onPanel &&
            removePanelMember(
              {
                ...x,
                isStreaming: false,
                isScreenSharing: false,
                onPanel: false,
                showCam: false,
                muteMic: false,
              },
              "remove"
            );
        });
        break;
      case "end_poll":
        user.panel.forEach((x) => {
          x.onPanel &&
            removePanelMember(
              {
                ...x,
                isStreaming: false,
                isScreenSharing: false,
                onPanel: false,
                showCam: false,
                muteMic: false,
              },
              "remove"
            );
        });
        setStartPoll(false);
        setEndPoll(true);
        user.uid !== userId &&
          getChannelToast(
            "success",
            `${user.appid} has ended the poll`,
            user,
            TOAST_TIMER
          );
        liveStream.leaveChannel("video");
        liveStream.leaveChannel("screen");
        // user.uid === userId && handleEndPoll(user);
        break;
    }
  };

  ///////////Room Handlers//////////////////////////////////////////////
  const enterRoom = async (user: IUserPresence) => {
    if (user.uid === userId) {
      const auditHistory = channelData.auditHistory.map((x) => x.action);
      switch (true) {
        case auditHistory.includes("Poll Ended"):
          setStartPoll(undefined);
          setEndPoll(true);
          return;
        case !auditHistory.includes("Poll Ended") &&
          auditHistory.includes("Poll Started"):
          setStartPoll(true);

          if (user.isMod) {
            startPollAsAdmin("Host Back", user);
          } else {
            await liveStream.enterChannel("video", false, userId);
            // const ids = await liveStream.enterChannel("video", false, userId);

            // const updatedUser = {
            //   ...user,
            //   agoraId: ids?.uid ?? "",
            // };

            // console.log({ ids, updatedUser });

            // user.uid === channelUser._id && updateStatus(updatedUser);

            getCurrentPanel(user);
          }
          return;

        default:
          setStartPoll(false);
      }
    }
  };

  const leaveRoom = (user: IUserPresence) => {
    if (user.uid === userId) {
      liveStream.leaveChannel("screen");
      liveStream.leaveChannel("video");
    }
    setPanelMembers((prev) => prev.filter((x) => x.appid !== user.appid));
    user.uid !== userId &&
      user.onPanel &&
      getChannelToast(
        "error",
        `${user.appid} left the poll.`,
        user,
        TOAST_TIMER
      );
  };

  ///Live Stream Handlers////////////////////////////////
  // const startStream: TStartLiveStream = async (user, mediaType) => {
  //   toggleControl(mediaType, true);
  //   // setMediaTracks(await liveStream.startMediaStream(mediaType));

  //   toggleControl(mediaType, false);
  // };

  const handleScreenShare: THandleDevice = async (user) => {
    const { audio, video, screen } =
      liveStream.clientDetails.getMediaTrackStatus();

    try {
      let updatedUser = user;
      toggleControl("screen", true);
      if (!user.screenAgoraId) {
        const ids = await liveStream.enterChannel("screen", true, user.uid);

        updatedUser = {
          ...updatedUser,
          screenAgoraId: ids?.uid,
          token: ids?.token,
        };
      }

      if (user.isScreenSharing) {
        await liveStream.startScreenStream(publishToChannel, updatedUser);
        !audio &&
          (await liveStream.startMediaStream(
            ["audio"],
            publishToChannel,
            user
          ));
        // !audio && (await handleAudio({ ...updatedUser, muteMic: true }));
        // !audio &&
        //   (await liveStream.startMediaStream(["audio"], publishToChannel, user));
      } else {
        await liveStream.stopStream("screen");
        video && (await liveStream.publishMediaStream("video"));
      }
      // const isAudioShared =
      //   liveStream.clientDetails.isMediaTrackPublished("audio");

      // if (user.isScreenSharing) {
      //   toggleControl("screen", true);
      //   const screenAgoraId = await liveStream.enterChannel(
      //     "screen",
      //     true,
      //     user.uid
      //   );
      //   updatedUser = { ...updatedUser, screenAgoraId };
      //   await liveStream.startScreenStream(publishToChannel, user);
      //   // isVideoShared && liveStream.stopStream("video");
      //   // await liveStream.startMediaStream(
      //   //   isAudioShared ? ["screen"] : ["screen", "audio"],
      //   //   publishToChannel,
      //   //   user
      //   // );
      // } else {
      //   await liveStream.stopStream("video");
      //   // user.showCam &&
      //   //   (await liveStream.startMediaStream(["video"], publishToChannel, user));
      // }
      updateStatus(updatedUser);
      publishToChannel("Update Panel", updatedUser);
      toggleControl("screen", false);
    } catch (err) {
      toggleControl("screen", false);
      publishToChannel(`Decline Screen Share`, {
        ...user,
        isScreenSharing: false,
      });
    }
  };

  const declineScreenShare: TOtherChannelHandler = (user) => {
    userId === user.uid && updateStatus(user);
    updatePanelMember(user);
    userId !== user.uid &&
      publishToChannel(`${user.appid} declined to share screen`, user);
  };

  const handleVideoCamera: THandleDevice = async (user) => {
    ///// When clicking off the video poll page using the topic or subtopic tag links, and coming
    //// back to the poll page for a poll currently in progress, when trying to share video, page
    //// crashes.  Fix this.  It is because the agoraId is not being generated.  Possibly because the
    /// useLiveStream hook isnt triggering or generating a new agora uid.  Need a way to generate this on the
    //// fly if the agora uid doesnt exist when printing out user data.  It works sometimes.  Need to figure out
    /// why it isnt consistent.
    const { audio, video, screen } =
      liveStream.clientDetails.getMediaTrackStatus();
    let updatedUser = user;

    switch (true) {
      case screen && !video:
        toggleControl("video", true);
        await liveStream.startMediaStream(
          ["video"],
          publishToChannel,
          updatedUser
        );
        updateStatus(updatedUser);
        publishToChannel("Update Panel", updatedUser);
        toggleControl("video", false);
        return;
      case video:
        updateStatus(updatedUser);
        publishToChannel("Update Panel", updatedUser);
        await liveStream.toggleCamera();
        return;

      case audio:
        toggleControl("video", true);
        await liveStream.startMediaStream(
          ["video"],
          publishToChannel,
          updatedUser
        );
        toggleControl("video", false);
        return;
      default:
        toggleControl("video", true);
        await liveStream.startMediaStream(
          ["audio", "video"],
          publishToChannel,
          updatedUser
        );
        updatedUser = { ...updatedUser, muteMic: true };
        updateStatus(updatedUser);
        publishToChannel("Update Panel", updatedUser);
        toggleControl("video", false);
        return;
    }
  };

  const handleAudio: THandleDevice = async (user) => {
    const { audio, screen } = liveStream.clientDetails.getMediaTrackStatus();

    if (audio) {
      await liveStream.toggleMic();
    } else {
      toggleControl("audio", true);
      !screen &&
        (await liveStream.startMediaStream(
          ["video", "audio"],
          publishToChannel,
          user
        ));
      await liveStream.toggleCamera();
    }

    updateStatus(user);
    publishToChannel("Update Panel", user);
    toggleControl("audio", false);
  };

  const handleMicAudio: TOtherChannelHandler = async (user) => {
    updatePanelMember(user);
    if (user.uid === userId) {
      liveStream.toggleMic();
      updateStatus(user);
    }
  };

  const handleHostCamera: TOtherChannelHandler = async (user) => {
    updatePanelMember(user);
    if (user.uid === userId) {
      liveStream.toggleCamera();
      updateStatus(user);
    }
  };

  const handleRecording: TOtherChannelHandler = async (user) => {
    try {
      setRecordLoading(true);
      await liveStream.handleLiveStreamRecording(
        channelData._id,
        user.uid,
        user.token ?? "",
        record
      );
      setRecordLoading(false);
      setRecord(!record);
    } catch (err) {
      throw err;
    }
  };

  // const handleDevice: THandleDevice = async (user, mediaType) => {
  //   const isMediaTracked = mediaTracks && mediaType in mediaTracks;
  //   switch (true) {
  //     case mediaType === "screen" && isMediaTracked:
  //       mediaTracks && liveStream.stopStream(mediaTracks[mediaType]);
  //       break;
  //     case mediaType === "audio" && isMediaTracked:
  //       await liveStream.toggleMic();
  //       break;
  //     case mediaType === "video" && isMediaTracked:
  //       await liveStream.toggleCamera();
  //       break;
  //     default:
  //       await startStream(user, mediaType);

  //       break;
  //   }

  //   updateStatus(user);
  //   publishToChannel("Update Panel", user);
  // };

  ////Poll Handlers ////////////////////////////////////

  const updatePollHistory = (msg: string) => {
    updateVideoPoll({
      variables: { pollId: channelData._id, msg },
    });
  };

  const startPollAsAdmin: TStartPollAsAdmin = async (msg: string, user) => {
    let host: IUserPresence | undefined;

    if (user) {
      host = user;
    } else {
      host = presenceData.find(
        (x) => x.data.uid === channelData.creator?._id
      )?.data;
    }

    if (host) {
      !user && setStartPollLoading(true);
      try {
        const ids = await liveStream.enterChannel("video", true, host.uid);
        const pollMod = {
          ...host,
          pollStarted: true,
          onPanel: true,
          agoraId: ids?.uid ?? "",
          token: ids?.token ?? "",
          muteMic: false,
        };

        msg && publishToChannel(msg, pollMod);
        updateStatus(pollMod);
        !user && updatePollHistory(msg);
        !user && setStartPollLoading(false);
      } catch (err) {
        throw err;
      }
    }
  };

  const handleStartPoll = async (user: IUserPresence) => {
    // All Other users besides Poll Creator will enter Livestream
    setStartPoll(true);
    setPanelMembers([user]);

    if (userId !== user.uid) {
      await liveStream.enterChannel("video", false, userId);

      getChannelToast(
        "success",
        `${user.appid} has started the poll!`,
        user,
        TOAST_TIMER
      );
    }
  };

  // const handleEndPoll: TOtherChannelHandler = (user) => {
  //   setStartPoll(false);
  //   setEndPoll(true);
  //   publishToChannel("Poll Ended", user);
  // };

  ///Panel Handlers//////////////////////////////////////
  const getCurrentPanel = (user: IUserPresence) => {
    channel.presence.get(async (err, members) => {
      if (err) {
        return [];
      }
      const panel = members
        ?.map(({ data }: { data: IUserPresence }) =>
          user.uid === data.uid ? user : data
        )
        .filter((y: IUserPresence) => y.onPanel)
        .sort((a: any, b: any) => b.isMod - a.isMod);

      panel && setPanelMembers(panel);
    });
  };

  const handlePanel: TOtherChannelHandler = (panelMember) =>
    publishToChannel(
      panelMember.onPanel ? "User Invited" : "Remove User",
      panelMember
    );

  const handleMemberInvite = (answer: boolean) => {
    const userPresense = presenceData.find(
      (x) => x.data.appid === channelUser?.appid
    );
    const channelMssg = !answer ? "User Declined" : "User Accepted";

    if (userPresense) {
      const updatedUser = {
        ...userPresense.data,
        pollStarted: true,
        onPanel: answer,
        requestInvite: false,
      };

      userId === updatedUser.uid && updateStatus(updatedUser);
      publishToChannel(channelMssg, updatedUser);
    }

    msgModalProps.onClose();
  };

  const togglePanelModal: TOtherChannelHandler = (user) => {
    // setModalContent({
    //   title: `${user.appid} has invited you to join the panel`,
    //   mssg: `If you accept the invite, you can share your screen or be a part of the live discussion!`,
    //   handler: handleMemberInvite,
    // });
    user.onPanel && msgModalProps.onOpen();
  };

  const panelAcceptInvite = async (user: IUserPresence) => {
    setPanelMembers((prev) => getUniqueObjsList([...prev, user], "appid"));
  };

  const panelDeclineInvite = (user: IUserPresence) => {
    if (channelUser.appid === channelData.creator?.appid) {
      userId === user.uid && updateStatus({ ...user, requestInvite: false });
      getChannelToast(
        "error",
        `${user.appid} declined the invite.`,
        user,
        TOAST_TIMER
      );
    }
  };

  const updatePanelMember: TOtherChannelHandler = (user) =>
    setPanelMembers((prev) => prev.map((x) => (x.uid === user.uid ? user : x)));

  ///////Other Handlers/////////////////////////////////////////////////
  const toggleControl = (mediaType: TMediaType, val: boolean) => {
    let stateSetter: React.Dispatch<React.SetStateAction<boolean>>;
    switch (mediaType) {
      case "audio":
        stateSetter = setAudioLoading;
        break;
      case "screen":
        stateSetter = setScreenLoading;
        break;
      default:
        stateSetter = setVideoLoading;
        break;
    }
    stateSetter(val);
  };

  const handleNewMssgTrigger: THandleMessageTrigger = (msgUserId, msgType) => {
    if (userId !== msgUserId) {
      msgType === "chat" ? isNewChat(true) : isNewQA(true);
    }
  };

  const closeMssgTrigger = (msgType: TPollMssgType) => {
    switch (msgType) {
      case "chat":
        isNewChat(false);
        return;
      case "qa":
        isNewQA(false);
        return;
    }
  };

  const handleInviteRequests: TOtherChannelHandler = (user) => {
    user.uid === userId && updateStatus({ ...user, requestInvite: true });
    isMod &&
      getChannelToast(
        "success",
        `${user.appid} wants to join the panel!`,
        user,
        TOAST_TIMER
      );
  };

  const removePanelMember: TRemovePanelMember = (user, msgType) => {
    if (user.uid === userId) {
      updateStatus(user);
      liveStream.stopStream();
    }
    setPanelMembers((prev) => prev.filter((x) => x.appid !== user.appid));

    if (msgType === "remove") {
      !isMod &&
        getChannelToast(
          "error",
          `${user.appid} removed from the panel.`,
          user,
          TOAST_TIMER
        );
      return;
    }
    user.uid !== userId &&
      user.pollStarted &&
      user.onPanel &&
      getChannelToast(
        "error",
        `${user.appid} left the panel.`,
        user,
        TOAST_TIMER
      );
  };

  return {
    startPoll,
    startPollLoading,
    endPoll,
    updatePollHistory,
    startPollAsAdmin,
    panelMembers,
    publishToChannel,
    users:
      presenceData
        .map((x) => x.data)
        .sort((x: any, y: any) => y.isMod - x.isMod) ?? [],
    liveStream,
    msgModalProps,
    handleMemberInvite,
    handlePanel,
    broadCastData,
    // modalContent,
    containerMssgs: {
      handleNewMssgTrigger,
      closeMssgTrigger,
      newChat,
      newQA,
    },
    stream: {
      videoLoading,
      audioLoading,
      screenLoading,
      recordLoading,
      record,
      handleScreenShare,
      handleAudio,
      handleVideoCamera,
      handleRecording,
    },
  };
};

export default useMsgChannel;
