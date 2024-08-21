import {
  IAgoraRTC,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  ILocalAudioTrack,
  ILocalTrack,
  ILocalVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import {
  TEnableVideoControls,
  THandleListeners,
  THandlerUserJoined,
  TInitChannel,
  TInitClient,
  TStartStream,
  TStopStream,
  TUseLiveStream,
  THandleClientListeners,
  TStartDeviceStream,
  TGetMediaTrackStatus,
  TAttachLocalVideo,
  TAttachRemoteVideo,
  TPublishStream,
  THandleUserUnpublished,
  TGetMediaDivs,
  TClientType,
  TLiveSteamRecord,
  IUserSessionData,
} from "./media";
import GraphResolvers from "_apiGraphStrings/index";
import { useLazyQuery, useMutation } from "@apollo/client";
import styles from "./media.module.css";

const useLiveStream: TUseLiveStream = (channel, userId) => {
  const agoraRef: any = useRef<IAgoraRTC>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const screenRef = useRef<IAgoraRTCClient | null>(null);

  //State Management
  const [clientReady, setClientReady] = useState(false);
  const [browserAudioFailed, setBrowserAudioFailed] = useState(false);
  const [recordSessionKeys, setRecordSessionKeys] = useState({
    resourceId: "",
    sid: "",
  });
  const [userSessionData, setUserSessionData] = useState<IUserSessionData>({});

  //Api Query to get Livestream Token
  const [getVideoCredentials] = useLazyQuery(
    GraphResolvers.queries.GET_STREAM_KEYS
  );

  const [getLiveStreamUserId] = useLazyQuery(
    GraphResolvers.queries.GET_LIVESTREAM_USER_ID
    // { onCompleted: (res) => setUserData([...userData, res.getLiveStreamUser]) }
  );

  //Api Query to Start and Stop Recording
  const [startRecording] = useMutation(
    GraphResolvers.mutations.START_RECORDING
  );
  const [stopRecording] = useMutation(GraphResolvers.mutations.STOP_RECORDING);
  const [addUidUserId] = useMutation(GraphResolvers.mutations.ADD_UID_USERID);

  ///////////////////Initialize LiveStream//////////////////////////////////////////
  const initClient: TInitClient = () => {
    import("agora-rtc-sdk-ng").then(async ({ default: AgoraRTC }) => {
      AgoraRTC.setLogLevel(3); //Used for debug mssgs on devTools
      agoraRef.current = AgoraRTC;
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      const screen_client = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });
      // console.log({screenId: screen_client.})
      clientRef.current = client;
      screenRef.current = screen_client;
      handleListeners(client);
      // handleListeners(screen_client, "screen");
      setClientReady(true);
    });
  };

  const enterChannel: TInitChannel = async (
    clientType,
    isPublisher,
    userId
  ) => {
    const client = (
      clientType === "video" ? clientRef.current : screenRef.current
    ) as IAgoraRTCClient;

    try {
      if (client.connectionState === "DISCONNECTED") {
        const { data } = await getVideoCredentials({
          variables: { channel, isPublisher },
        });
        const options = {
          ...data.getStreamKeys,
          channel,
          uid: 0,
          role: isPublisher ? "host" : "audience",
        };

        const uid = await client.join(
          options.appId,
          channel,
          options.token
          // userId ? `${userId}_${clientType}` : null
        );

        handleBrowserAudioFailed();

        return {
          uid: uid.toString(),
          token: isPublisher ? data.getStreamKeys.token : "",
        };
      }
    } catch (err: any) {
      return err;

      //Need to handle token expiration errors (current token lasts 5 hours)
      // console.log("error message is this: ", err.message);
    }
  };

  const leaveChannel = async (clientType: "video" | "screen") => {
    const client = (
      clientType === "video" ? clientRef.current : screenRef.current
    ) as IAgoraRTCClient;
    // const client = clientRef.current as IAgoraRTCClient;
    stopStream();
    if (client.connectionState === "CONNECTED") {
      client?.unpublish();
      document.getElementById(`user-${client?.uid}`)?.remove();
    }

    client?.removeAllListeners();
    setClientReady(false);
    client?.leave();
  };

  const handleBrowserAudioFailed = () => {
    (agoraRef.current as IAgoraRTC).onAudioAutoplayFailed = () => {
      setBrowserAudioFailed(true);
    };
  };

  ////////////////LiveStream Handlers///////////////////////////////////////
  const getMediaTrackStatus: TGetMediaTrackStatus = () => {
    return {
      audio:
        clientRef.current?.localTracks.some(
          (track) => track.trackMediaType === "audio"
        ) ?? false,
      screen:
        screenRef.current?.localTracks.some(
          (track) => track.trackMediaType === "video"
        ) ?? false,
      video:
        clientRef.current?.localTracks.some(
          (track) => track.trackMediaType === "video"
        ) ?? false,
    };
    // clientRef.current?.localTracks.forEach(
    //   (track) => (mediaStatus[track.trackMediaType] = true)
    // );
    // return (clientRef.current as IAgoraRTCClient).localTracks.some(
    //   (track) => track.trackMediaType === streamType
    // );
  };

  const publishMediaStream: TPublishStream = async (streamType) => {
    const client = (
      streamType === "screen" ? screenRef.current : clientRef.current
    ) as IAgoraRTCClient;

    try {
      const mediaTrack = client.localTracks.find(
        (track) => track.trackMediaType === streamType
      );
      mediaTrack && (await client.publish(mediaTrack));
    } catch (err) {
      throw err;
    }
  };

  const startVideoStream = async () => {
    const client = clientRef.current as IAgoraRTCClient;
    const agora = agoraRef.current as IAgoraRTC;

    const isVideoPublished = getMediaTrackStatus().video;
    isVideoPublished && stopStream("video");

    const track = await agora.createCameraVideoTrack({
      encoderConfig: "1080p_2",
    });

    await addUidUserId({
      variables: {
        channelName: channel,
        uid: client.uid?.toString(),
        clientType: "video",
        userId,
      },
    });

    attachLocalVideo(`${userId}_video` as string, track);
    // attachLocalVideo(client.uid as string, track);
    return track;
  };

  const startScreenStream: TStartDeviceStream = async (
    publishToChannel,
    user
  ) => {
    try {
      const client = screenRef.current as IAgoraRTCClient;
      const agora = agoraRef.current as IAgoraRTC;

      const existingVideoTrack = client.localTracks.find(
        (track) => track.trackMediaType === "video"
      );

      existingVideoTrack && client.unpublish(existingVideoTrack);
      // const isVideoPublished = isMediaTrackPublished("video");
      // isVideoPublished && client.unpublish(client.localTracks[1])

      const track = await agora.createScreenVideoTrack(
        {
          encoderConfig: "1080p_2",
          screenSourceType: "screen",
        },
        "disable"
      );

      handleScreenListeners(track, publishToChannel, user);

      await addUidUserId({
        variables: {
          channelName: channel,
          uid: client.uid?.toString(),
          clientType: "screen",
          userId,
        },
      });

      await client.publish(track);
      user && publishToChannel(`${user.appid} started screen sharing`, user);
    } catch (err) {
      throw err;
      // user &&
      //   publishToChannel(`Decline Screen Share`, {
      //     ...user,
      //     isScreenSharing: false,
      //   });
      // user && publishToChannel(`${user.appid} declined to share screen`, user);
    }
  };

  const startAudioStream = async () => {
    const client = clientRef.current as IAgoraRTCClient;
    const agora = agoraRef.current as IAgoraRTC;
    return await agora.createMicrophoneAudioTrack({
      AEC: true,
      ANS: true,
    });
  };

  const startMediaStream: TStartStream = async (
    streamTypes,
    publishToChannel,
    user
  ) => {
    const client = clientRef.current as IAgoraRTCClient;
    try {
      const tracks = await Promise.all(
        streamTypes.map(async (sType) => {
          if (sType === "audio") {
            return await startAudioStream();
          }

          return await startVideoStream();
        })
      );

      await client.publish(tracks);
    } catch (err) {
      throw err;
    }
  };

  const stopAllStreams = async () => {
    clientRef.current?.localTracks.forEach((track) => {
      track.stop();
      track.close();
    });
    screenRef.current?.localTracks.forEach((track) => {
      track.stop();
      track.close();
    });

    removeStreams(clientRef.current as IAgoraRTCClient);
    removeStreams(screenRef.current as IAgoraRTCClient);
  };

  const stopStream: TStopStream = async (streamType) => {
    const client = (
      streamType === "screen" ? screenRef.current : clientRef.current
    ) as IAgoraRTCClient;

    if (!streamType) {
      stopAllStreams();
      return;
    }

    const mediaType = streamType === "screen" ? "video" : streamType;

    const mediaTrack = client.localTracks.find(
      (track) => track.trackMediaType === mediaType
    );
    if (mediaTrack) {
      mediaTrack.stop();
      mediaTrack.close();
      await client.unpublish(mediaTrack);
    }
    // const mediaTrack = client.localTracks.find(
    //   (track) => track.getTrackId() === streamId
    // );
    // if (mediaTrack) {
    //   mediaTrack.stop();
    //   mediaTrack.close();
    //   client.unpublish(mediaTrack);
    // }
  };

  const removeStreams = async (client: IAgoraRTCClient) => {
    client.localTracks.length > 0 && (await client.unpublish());
  };

  const toggleMic = async () => {
    const client = clientRef.current;
    const mic: any = client?.localTracks[1];

    mic && (await mic.setMuted(!mic.muted));
  };

  const toggleCamera = async () => {
    const client = clientRef.current;
    const cam: any = client?.localTracks[0];
    cam && (await cam.setMuted(!cam.muted));
  };

  //Create Video Player and append to Video Container
  const attachLocalVideo: TAttachLocalVideo = async (uid, videoTrack) => {
    // Sometimes the uid isnt being recognized.  If the uid is empty here (which is coming from agora)
    // get the uid from the current client and use that so nothing returns a big error
    // console.log("triggered attac local audio", {
    //   uid,
    //   client: clientRef.current,
    //   screen: screenRef.current,
    // });

    // if (!uid) {
    //   const data = await enterChannel("video", true, userId);
    //   if (data) {
    //     uid = data?.uid;
    //   }
    // }
    // const vidCtr = document.getElementById(uid);
    // console.log({ uid, vidCtr });
    const vidCtr = document.getElementById(uid.split("_")[0]);
    let player = document.getElementById(`user-${uid}`);
    player !== null && player.remove();

    if (vidCtr) {
      const player = document.createElement("div");
      player.id = `user-${uid}`;
      player.className = `${styles.videoPlayer}`;
      vidCtr.appendChild(player);
      videoTrack?.play(player.id, { fit: "contain" });
      // videoTrack && enableVideoControls(videoTrack);
    }
  };

  const attachMiniVideo = (trackDiv: HTMLElement, userId: string) => {
    trackDiv.className = `${styles.miniVideoPlayer}`;
    $(`#${trackDiv.id}`).prependTo(`#${userId}_mini_video`);
    // console.log({
    //   trackDiv,
    //   parent: document.getElementById(`${userId}_mini_video`),
    // });
  };

  const attachMainVideo = (
    uid: string,
    videoTrack: IRemoteVideoTrack,
    parentCtr: HTMLElement
  ) => {
    const player = document.createElement("div");
    player.id = `user-${uid}`;
    player.className = `${styles.videoPlayer}`;
    parentCtr.appendChild(player);
    videoTrack.play(player.id, { fit: "contain" });
  };

  const attachRemoteVideo: TAttachRemoteVideo = (uid, videoTrack) => {
    const { streamType, parentVidCtr, miniVidCtr, videoDiv, screenDiv } =
      getMediaDivs(uid);
    const userId = uid.toString().split("_")[0];

    if (parentVidCtr) {
      switch (true) {
        case streamType === "video" && videoDiv !== null && screenDiv === null: //Div already exists from before and is video div
          videoTrack.play(videoDiv as HTMLElement, { fit: "contain" });
          return;
        case streamType === "screen" && videoDiv !== null && screenDiv === null:
          attachMiniVideo(videoDiv as HTMLElement, userId);
          attachMainVideo(uid, videoTrack, parentVidCtr);
          return;
        case streamType === "video" && videoDiv !== null && screenDiv !== null:
          videoTrack.play(videoDiv as HTMLElement, { fit: "cover" });
          return;
        case streamType === "video" && videoDiv === null && screenDiv !== null:
          const miniVideo = document.createElement("div");
          miniVideo.id = `user-${uid}`;
          miniVideo.className = `${styles.miniVideoPlayer}`;
          videoTrack.play(miniVideo, { fit: "cover" });
          miniVidCtr?.prepend(miniVideo);
          return;
        default:
          attachMainVideo(uid, videoTrack, parentVidCtr);
          return;
      }
    }
  };

  const enableVideoControls: TEnableVideoControls = (videoTrack) => {
    const videoId = videoTrack?.getTrackId();
    const videoTag = document.getElementById(`video_${videoId}`);
    const videoTagCtr = document.getElementById(
      `agora-video-player-${videoId}`
    );
    if (videoTagCtr && videoTag) {
      (videoTag as HTMLVideoElement).controls = true;
      (videoTag as HTMLVideoElement).style.transform = "rotateY(0deg)";
    }
  };

  const getMediaDivs: TGetMediaDivs = (uid) => {
    const userId_split = uid.toString().split("_");
    const userId = uid.toString().split("_")[0];
    const streamType = userId_split[1] as TClientType;

    const parentVidCtr = document.getElementById(userId);
    const miniVidCtr = document.getElementById(`${userId}_mini_video`);
    const videoDiv = document.getElementById(`user-${userId}_video`);
    const screenDiv = document.getElementById(`user-${userId}_screen`);

    return { streamType, parentVidCtr, miniVidCtr, videoDiv, screenDiv };
  };

  const handleLiveStreamRecording: TLiveSteamRecord = async (
    channelId,
    userId,
    token,
    isRecording
  ) => {
    let resp: any;
    try {
      if (!isRecording) {
        resp = await startRecording({
          variables: { channelId, userId, token },
        });
        resp && setRecordSessionKeys(resp.data.startLiveStreamRecording);
        return;
      }
      resp = await stopRecording({
        variables: { channelId, ...recordSessionKeys },
      });
    } catch (err) {
      throw err;
    }
  };

  const getPlayerDivId = async (user: IAgoraRTCRemoteUser) => {
    if (user.uid in userSessionData) {
      return userSessionData[user.uid];
    } else {
      const { data } = await getLiveStreamUserId({
        variables: { liveStreamId: user.uid.toString(), pollId: channel },
      });

      const newSessionData = {
        isHost: data.getLiveStreamUser.userId === userId ?? false,
        divId:
          `${data.getLiveStreamUser.userId}_${data.getLiveStreamUser.mediaType}` ??
          "",
      };

      setUserSessionData((prev) =>
        prev ? { ...prev, [user.uid]: newSessionData } : prev
      );
      return newSessionData;
    }
  };

  /////////////////Event Listeners//////////////////////////////////////////
  const handleListeners: THandleListeners = async (client) => {
    client.on("user-published", (user, mediaType) =>
      handleUserJoined(user, mediaType, client)
    );
    client.on("user-left", (user) => {});
    client.on("user-joined", (user) => {});
    client.on("user-unpublished", handleUserUnpublished);
  };

  const handleUserUnpublished: THandleUserUnpublished = async (
    user,
    mediaType
  ) => {
    const { divId } = await getPlayerDivId(user);
    const { streamType, parentVidCtr, miniVidCtr, videoDiv, screenDiv } =
      getMediaDivs(divId);
    // const { streamType, parentVidCtr, miniVidCtr, videoDiv, screenDiv } =
    //   getMediaDivs(user.uid.toString());

    if (streamType === "screen" && videoDiv !== null && mediaType === "video") {
      screenDiv !== null && screenDiv.remove();
      videoDiv.className = `${styles.videoPlayer}`;
      $(`#${videoDiv.id}`).appendTo(`#${parentVidCtr?.id}`);
    } else if (
      streamType === "screen" &&
      videoDiv === null &&
      mediaType === "video"
    ) {
      screenDiv?.remove();
    }
  };

  const handleScreenListeners: THandleClientListeners = async (
    track,
    publish,
    user
  ) => {
    (track as ILocalVideoTrack).on("track-ended", () => {
      stopStream("screen");
      publish("Stop Share", {
        ...user,
        isScreenSharing: false,
      });
    });
  };

  const handleUserJoined: THandlerUserJoined = async (
    user,
    mediaType,
    client
  ) => {
    const { isHost, divId } = await getPlayerDivId(user);
    // // const uid = user.uid.toString().split("_")[0];
    // const isHost = data.getLiveStreamUser.userId === userId;
    // const client = clientRef.current as IAgoraRTCClient;

    try {
      !isHost && (await client.subscribe(user, mediaType));

      if (mediaType === "video") {
        // let player = document.getElementById(`user-${user.uid}`);
        // console.log({ user, player });
        // player !== null && player.remove();
        !isHost &&
          attachRemoteVideo(
            divId,
            // user.uid as string,
            user.videoTrack as IRemoteVideoTrack
          );
        handleBrowserAudioFailed();
        return;
      }

      if (user.audioTrack) {
        user.audioTrack.play();
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    initClient();
    return () => {
      leaveChannel("video");
      leaveChannel("screen");
    };
  }, []);

  return {
    clientReady,
    initClient,
    enterChannel,
    leaveChannel,
    startMediaStream,
    startScreenStream,
    publishMediaStream,
    stopStream,
    handleLiveStreamRecording,
    toggleCamera,
    toggleMic,
    clientDetails: {
      getMediaTrackStatus,
    },
  };
};

export default useLiveStream;
