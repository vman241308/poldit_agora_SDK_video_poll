import { useLazyQuery } from "@apollo/client";
import {
  IAgoraRTC,
  IAgoraRTCClient,
  ICameraVideoTrack,
  ILocalVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import React, { useEffect, useRef, useState } from "react";
import GraphResolvers from "_apiGraphStrings/index";
import { IUserPresence } from "../channel/useChannel";
import {
  IStreamOptions,
  TAttachVideo,
  TCameraVideoAudioTracks,
  TCloseClient,
  TGetClientDetails,
  THandleClientListeners,
  THandleListeners,
  THandlerUserJoined,
  THandleStream,
  THandleUserLeft,
  TInitChannel,
  TInitClient,
  TIsPlaying,
  TLeaveStream,
  TScreenVideoTracks,
  TShareStream,
  TStopStream,
  TToggleStream,
  TUseLiveStream,
} from "./media_old";
import styles from "./media.module.css";

const useLiveStream: TUseLiveStream = (
  channel,
  isPublisher,
  sendChannelMsg
) => {
  const agoraRef: any = useRef<IAgoraRTC>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const screenRef = useRef<IAgoraRTCClient | null>(null);
  const [clientReady, setClientReady] = useState(false);
  const [browserAudioFailed, setBrowserAudioFailed] = useState(false);

  let localTracks: TCameraVideoAudioTracks | [] = [];
  let localScreenTracks: TScreenVideoTracks;
  let localAudioTrack: IMicrophoneAudioTrack;

  const [getVideoCredentials] = useLazyQuery(
    GraphResolvers.queries.GET_STREAM_KEYS
  );

  // const initClient: TInitClient = () => {
  //   import("agora-rtc-sdk-ng").then(async ({ default: AgoraRTC }) => {
  //     AgoraRTC.setLogLevel(3); //Used for debug mssgs on devTools
  //     agoraRef.current = AgoraRTC;
  //     const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  //     const screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  //     clientRef.current = client;
  //     screenRef.current = screenClient;
  //     handleListeners(client);

  //     // if (isPublisher) {
  //     //   await initChannel("video", true);
  //     //   await initChannel("screen", true);
  //     // }

  //     setClientReady(true);
  //   });
  // };

  const initClient: TInitClient = async (userId = "") => {
    return await new Promise((resolve, reject) => {
      import("agora-rtc-sdk-ng")
        .then(async ({ default: AgoraRTC }) => {
          AgoraRTC.setLogLevel(3); //Used for debug mssgs on devTools
          agoraRef.current = AgoraRTC;
          const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
          const screenClient = AgoraRTC.createClient({
            mode: "rtc",
            codec: "vp8",
          });
          clientRef.current = client;
          screenRef.current = screenClient;
          handleListeners(client);
          handleListeners(screenClient);
          // let agoraId: string = "";
          // let screenAgoraId: string = "";
          const agoraId =
            (await initChannel("video", isPublisher, userId)) ?? "";
          // const screenAgoraId =
          //   (await initChannel("screen", isPublisher, userId)) ?? "";

          // if (isStreaming || isPublisher) {
          //   agoraId = (await initChannel("video", isPublisher)) ?? "";
          // }
          // if (isScreenSharing || isPublisher) {
          //   screenAgoraId = (await initChannel("screen", isPublisher)) ?? "";
          // }

          resolve({ agoraId, screenAgoraId: "" });
        })
        .catch((err) => reject(err));
    });
  };

  // const initClient: TInitClient = async () => {
  //   import("agora-rtc-sdk-ng").then(async ({ default: AgoraRTC }) => {
  //     AgoraRTC.setLogLevel(3); //Used for debug mssgs on devTools
  //     agoraRef.current = AgoraRTC;
  //     const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  //     const screenClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  //     clientRef.current = client;
  //     screenRef.current = screenClient;
  //     handleListeners(client);

  //     // await initChannel("video", isPublisher);
  //     // await initChannel("screen", isPublisher);

  //     // if (isPublisher) {
  //     //   await initChannel("video", true);
  //     //   await initChannel("screen", true);
  //     // }

  //     setClientReady(true);
  //   });
  // };

  const initChannel: TInitChannel = async (clientType, isHost, userId) => {
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
          role: isHost ? "host" : "audience",
        };

        const uid = await client.join(
          options.appId,
          channel,
          options.token,
          userId ? `${userId}_${clientType}` : null
        );
        handleBrowserAudioFailed();
        return uid.toString();
      }
    } catch (err: any) {
      return err;
      //Need to handle token expiration errors (current token lasts 5 hours)
      // console.log("error message is this: ", err.message);
    }
  };

  const handleBrowserAudioFailed = () => {
    (agoraRef.current as IAgoraRTC).onAudioAutoplayFailed = () => {
      setBrowserAudioFailed(true);
    };
  };

  const getAgoraUID = () => {
    return {
      agoraId: clientRef.current?.uid?.toString() ?? "",
      screenAgoraId: screenRef.current?.uid?.toString() ?? "",
    };
  };

  const getClientDetails: TGetClientDetails = (screenType) => {
    const client = (
      screenType === "video" ? clientRef.current : screenRef.current
    ) as IAgoraRTCClient;

    return {
      channelName: client.channelName,
      connectionState: client.connectionState,
    };
  };

  const toggleBrowserAudioBtn = () =>
    setBrowserAudioFailed(!browserAudioFailed);

  const closeConnection = () => {
    const client = clientRef.current;
    const screenClient = screenRef.current;
    client?.removeAllListeners();
    setClientReady(false);
    client?.leave();
    screenClient?.leave();
  };

  const unsubscribeStream = async (uid: string) => {
    const client = clientRef.current as IAgoraRTCClient;
    const remoteUser = client.remoteUsers.find((x) => x.uid === uid);
    remoteUser && client.unsubscribe(remoteUser);
  };

  const handleShareStream: TShareStream = async (isHost, user, streamType) => {
    const client = (
      streamType === "video" ? clientRef.current : screenRef.current
    ) as IAgoraRTCClient;
    // const client = clientRef.current as IAgoraRTCClient;
    // const screenClient = screenRef.current as IAgoraRTCClient;

    try {
      // const uid = (await initChannel(streamType, isHost, user.uid)) ?? "";
      // user[streamType === "video" ? "agoraId" : "screenAgoraId"] = uid;

      if (isHost) {
        switch (true) {
          case user.isStreaming:
            localScreenTracks && stopStream(user, "screen");
            await startStream(client, user);
            break;
          case user.isScreenSharing:
            localTracks.length > 0 && stopStream(user, "video");
            await startScreenStream(client, user);
            break;
          default:
            stopStream(user, streamType);
            break;
        }
      }
    } catch (err) {
      throw err;
    }

    // try {
    //   // const uid = await initChannel(streamType, isHost, user.uid);
    //   // const updatedUser = {
    //   //   ...user,
    //   //   agoraId: streamType === "video" ? uid : user.agoraId,
    //   //   screenAgoraId: streamType === "screen" ? uid : user.screenAgoraId,
    //   // };
    //   if (isHost) {
    //     switch (true) {
    //       case user.isStreaming:
    //         localScreenTracks && stopStream(user, "screen");
    //         await startStream(client, user);
    //         return;
    //       case user.isScreenSharing:
    //         localTracks.length > 0 && stopStream(user, "video");
    //         await startScreenStream(client, user);
    //         return;
    //       default:
    //         stopStream(user, streamType);
    //         return;
    //     }
    //   }
    // } catch (err) {
    //   throw err;
    // }
  };

  const startStream: TToggleStream = async (client, user) => {
    try {
      client.localTracks.length > 0 && (await client.unpublish());
      localTracks = await (
        agoraRef.current as IAgoraRTC
      ).createMicrophoneAndCameraTracks(
        { AEC: true, ANS: true },

        {
          // facingMode: "environment",
          // encoderConfig: {
          //   width: { min: 640, ideal: 1920, max: 1920 },
          //   height: { min: 480, ideal: 1080, max: 1080 },

          // },
          encoderConfig: "1080p_2",
        }
      );

      // handleVideoListeners(localTracks[1] as ICameraVideoTrack, user);

      attachVideo(client.uid as string, localTracks[1]);

      await client.publish(localTracks);
      user && sendChannelMsg("Started Streaming", user);
      // user && sendChannelMsg(`${user.appid} started streaming`, user);
    } catch (err) {
      user && sendChannelMsg(`${user.appid} declined to stream`, user);
    }
  };

  const startScreenStream: TToggleStream = async (client, user) => {
    const agora = agoraRef.current as IAgoraRTC;
    try {
      client.localTracks.length > 0 && (await client.unpublish());
      localScreenTracks = await agora.createScreenVideoTrack({
        encoderConfig: "1080p_2",
        screenSourceType: "screen",
      });

      handleScreenListeners(localScreenTracks as ILocalVideoTrack, user);

      localAudioTrack = await agora.createMicrophoneAudioTrack({
        AEC: true,
        ANS: true,
      });

      // attachVideo(client.uid as string, localScreenTracks as ILocalVideoTrack);

      await client.publish([
        localScreenTracks as ILocalVideoTrack,
        localAudioTrack,
      ]);
      user && sendChannelMsg(`${user.appid} started screen sharing`, user);
    } catch (err) {
      user && sendChannelMsg(`${user.appid} declined to share screen`, user);
    }
  };

  const stopStream: TStopStream = (user, screenType, hideMsg = false) => {
    screenType === "video" ? leaveStream() : leaveScreenShare();
    // leaveStream();
    user && document.getElementById(`user-${user.agoraId}`)?.remove();
    user &&
      !hideMsg &&
      sendChannelMsg(
        `${user.appid} stopped ${
          screenType === "video" ? "streaming" : "screen sharing"
        }`,
        user
      );
  };

  const leaveStream = () => {
    const client = clientRef.current as IAgoraRTCClient;
    console.log("client in leave stream", client);
    localTracks.forEach((el: any) => {
      el?.stop();
      el?.close();
    });

    client?.localTracks.length > 0 && client.unpublish();
  };

  const leaveScreenShare = () => {
    const client = screenRef.current as IAgoraRTCClient;
    console.log("client in leave stream", client);
    (localScreenTracks as ILocalVideoTrack)?.stop();
    (localScreenTracks as ILocalVideoTrack)?.close();
    localAudioTrack?.stop();
    localAudioTrack?.close();
    client?.localTracks.length > 0 && client.unpublish();
  };

  const attachVideo: TAttachVideo = (uid, videoTrack, audioTrack) => {
    const vidCtr = document.getElementById(uid as string);
    let player = document.getElementById(`user-${uid}`);
    player !== null && player.remove();

    console.log("In attachVideo: ", { uid, videoTrack, audioTrack, vidCtr });

    if (vidCtr) {
      // vidCtr.style.position = "relative";
      // vidCtr.style.overflow = "hidden";
      // vidCtr.style.paddingBottom = "56.25%";
      const player = document.createElement("div");
      player.id = `user-${uid}`;
      player.className = `${styles.videoPlayer}`;

      vidCtr.appendChild(player);
      videoTrack?.play(player.id, { fit: "cover" });
      audioTrack?.play();

      const videoId = videoTrack?.getTrackId();

      if (videoId) {
        const videoTag = document.getElementById(`video_${videoId}`);
        const videoTagCtr = document.getElementById(
          `agora-video-player-${videoId}`
        );

        if (videoTagCtr && videoTag) {
          // videoTagCtr.style.minWidth = "300px";
          // videoTagCtr.style.minHeight = "168px";
          //           videoTagCtr.style.minWidth = "300px";
          // videoTagCtr.style.minHeight = "168px";

          (videoTag as HTMLVideoElement).controls = true;
          (videoTag as HTMLVideoElement).style.transform = "rotateY(0deg)";
          // (videoTag as HTMLVideoElement).style.height = "400px";
          // (videoTag as HTMLVideoElement).style.width = "400px";
        }
      }
    }
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

  const isPlaying: TIsPlaying = (mediaType) => {
    const client = clientRef.current as IAgoraRTCClient;

    const currentTrack =
      mediaType === "audio" ? client.localTracks[0] : client.localTracks[1];

    return currentTrack.isPlaying;
  };

  const closeClient: TCloseClient = (clientId) => {
    leaveStream();
    leaveScreenShare();
    document.getElementById(`user-${clientId}`)?.remove();
    closeConnection();
  };

  /////////////////Event Listeners//////////////////////////////////////////

  const handleListeners: THandleListeners = async (client) => {
    client.on("user-published", (user, mediaType) =>
      handleUserJoined(user, mediaType, client)
    );
    client.on("user-left", (user) => handleUserLeft(user));
    client.on("user-joined", (user) => {
      // const remoteUsers = client.remoteUsers;
      // remoteUsers.forEach((rUser) => {
      //   if (
      //     rUser.uid !== user.uid &&
      //     rUser.hasVideo &&
      //     rUser.videoTrack?.isPlaying
      //   ) {
      //     handleUserJoined(rUser, "video");
      //   }
      // });
    });
    client.on("user-unpublished", (user) => {});
  };

  const handleScreenListeners: THandleClientListeners = async (track, user) => {
    (track as ILocalVideoTrack).on("track-ended", () => {
      user &&
        sendChannelMsg("Share Screen", {
          ...user,
          muteMic: true,
          isScreenSharing: !user.isScreenSharing,
          // isStreaming: false,
          showCam: false,
        });
    });
  };

  const handleVideoListeners: THandleClientListeners = async (track, user) => {
    (track as ICameraVideoTrack).on("video-element-visible-status", () => {});
  };

  const handleUserJoined: THandlerUserJoined = async (
    user,
    mediaType,
    client
  ) => {
    // const client = (
    //   mediaType === "video" ? clientRef.current : screenRef.current
    // ) as IAgoraRTCClient;
    // console.log({
    //   vidClient: clientRef.current,
    //   screenClient: screenRef.current,
    // });

    try {
      await client.subscribe(user, mediaType);

      if (mediaType === "video") {
        let player = document.getElementById(`user-${user.uid}`);
        console.log({ user, mediaType, client });
        player !== null && player.remove();
        attachVideo(user.uid as string, user.videoTrack, user.audioTrack);
        handleBrowserAudioFailed();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleUserLeft: THandleUserLeft = async (user) => {
    // console.log("user leaving");
  };

  // useEffect(() => {
  //   initClient();
  //   return () => {
  //     console.log("exit triggered in live stream");
  //     leaveStream();
  //     leaveScreenShare();
  //     closeConnection();
  //   };
  // }, []);

  return {
    clientReady,
    initClient,
    initChannel,
    browserAudioFailed,
    getAgoraUID,
    toggleBrowserAudioBtn,
    handleShareStream,
    stopStream,
    toggleMic,
    toggleCamera,
    unsubscribeStream,
    isPlaying,
    closeClient,
    getClientDetails,
  };
};

export default useLiveStream;
