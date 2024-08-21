import { IAgoraRTC, IAgoraRTCClient, ILocalVideoTrack } from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import {
  IStreamOptions,
  TAttachVideo,
  THandleListeners,
  THandlerUserJoined,
  THandleUserLeft,
  TScreenVideoTracks,
  TShareStream,
  TToggleStream,
  TUseScreenShare,
} from "./media_old";
import GraphResolvers from "_apiGraphStrings/index";
import { useLazyQuery } from "@apollo/client";

// const useScreenShare: TUseScreenShare = (
const useScreenShare: any = (channel:any, isPublisher:any, sendChannelMsg:any) => {
  const agoraRef: any = useRef<IAgoraRTC>(null);
  const clientRef: any = useRef(null);
  const [clientReady, setClientReady] = useState(false);
  const [shareScreen, setShareScreen] = useState(false);
  const [browserAudioFailed, setBrowserAudioFailed] = useState(false);

  let localTracks: TScreenVideoTracks;

  const [getVideoCredentials] = useLazyQuery(
    GraphResolvers.queries.GET_STREAM_KEYS
  );

  const initClient = () => {
    import("agora-rtc-sdk-ng").then(async ({ default: AgoraRTC }) => {
      AgoraRTC.setLogLevel(3); //Used for debug mssgs on devTools
      agoraRef.current = AgoraRTC;
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

      clientRef.current = client;
      handleListeners(client);

      if (isPublisher) {
        await initChannel(true);
      }

      setClientReady(true);
    });
  };

  const initChannel = async (isHost: boolean) => {
    const client = clientRef.current as IAgoraRTCClient;

    if (client.connectionState === "DISCONNECTED") {
      const { data } = await getVideoCredentials({
        variables: { channel, uid: "", isPublisher },
      });
      const options = {
        ...data.getStreamKeys,
        channel,
        uid: 0,
        role: isHost ? "host" : "audience",
      };

      await client.join(options.appId, channel, options.token);
      handleBrowserAudioFailed();
    }
    // const client = clientRef.current as IAgoraRTCClient;
    // const { data } = await getVideoCredentials({
    //   variables: { channel, uid: "", isPublisher },
    // });
    // const clientOptions = {
    //   ...data.getStreamKeys,
    //   channel,
    //   uid: 0,
    //   role: isHost ? "host" : "audience",
    // };

    // if (client.connectionState === "DISCONNECTED") {
    //   await client.join(clientOptions.appId, channel, clientOptions.token);
    //   handleBrowserAudioFailed();
    // }
  };

  const handleBrowserAudioFailed = () => {
    (agoraRef.current as IAgoraRTC).onAudioAutoplayFailed = () => {
      setBrowserAudioFailed(true);
    };
  };

  const getAgoraUID = () => {
    const client: IAgoraRTCClient = clientRef.current;
    return client.uid?.toString();
  };

  const toggleBrowserAudioBtn = () =>
    setBrowserAudioFailed(!browserAudioFailed);

//   const handleScreenShare: TShareStream = async (channel, isHost, user) => {
    const handleScreenShare: any = async (channel:any, isHost:any, user:any) => {
    const client: IAgoraRTCClient = clientRef.current;
    console.log({
      channel,
      user,
      client,
      connectionState: client.connectionState,
    });
    initChannel(isHost);
    // let clientOptions: IStreamOptions = options;

    // if (!clientOptions.token && !isPublisher) {
    //   initChannel(isHost);
    // }

    //Unpublish existing shared screen track if it already exists
    // client.connectionState === "CONNECTED" &&
    //   client.localTracks &&
    //   client.unpublish();

    isHost && user.isScreenSharing && (await startScreenShare(client, user));
    isHost && !user.isScreenSharing && (await stopScreenShare(client, user));

    // isHost && isScreenSharing && startScreenShare(client, user);
    // isHost && !isScreenSharing && stopScreenShare(client, user);
  };

  const attachVideo: TAttachVideo = (uid, videoTrack, audioTrack) => {
    const vidCtr = document.getElementById(uid as string);
    // let player = document.getElementById(`user-${uid}`);
    // player !== null && player.remove();

    if (vidCtr) {
      const player = document.createElement("div");
      player.id = `user-${uid}`;
      player.style.width = "100%";
      player.style.height = "100%";
      // player.style.aspectRatio="1/1"
      //   player.style.position = "absolute";
      //   player.style.top = "0";
      //   player.style.left = "0";
      //   player.style.aspectRatio = "4";
      //   player.style.objectFit = "none";
      vidCtr.appendChild(player);
      videoTrack?.play(player.id, { fit: "cover" });
    }
  };

  const startScreenShare: TToggleStream = async (client, user) => {
    try {
      localTracks = await (
        agoraRef.current as IAgoraRTC
      ).createScreenVideoTrack({});
      attachVideo(client.uid as string, localTracks as ILocalVideoTrack);

      await client.publish(localTracks);
      user && sendChannelMsg(`${user.appid} started screen sharing`, user);
    } catch (err) {
      user && sendChannelMsg(`${user.appid} declined to screen share.`, user);
    }
  };

  const stopScreenShare: TToggleStream = async (client, user) => {
    leaveStream();
    user && document.getElementById(`user-${user.agoraId}`)?.remove();
    user && sendChannelMsg(`${user.appid} stopped screen sharing`, user);
  };

  const leaveStream = () => {
    const client: IAgoraRTCClient = clientRef.current;
    document.getElementById(`user-${client.uid}`)?.remove();

    if (client.connectionState === "CONNECTED") {
      if (localTracks && Array.isArray(localTracks)) {
        localTracks.forEach((el: any) => {
          el.stop();
          el.close();
        });
        return;
      }
      if (localTracks) {
        localTracks.stop();
        localTracks.close();
      }
      client.localTracks.length > 0 ||
        (client.localTracks && client.unpublish());
    }
  };

  const closeConnection = () => {
    const client: IAgoraRTCClient = clientRef.current;
    client.removeAllListeners();
    setClientReady(false);
    client.leave();
  };

  /////////////////Event Listeners//////////////////////////////////////////

  const handleListeners: THandleListeners = async (client) => {
    client.on("user-published", handleUserJoined);
    client.on("user-left", (user) => handleUserLeft(user));
    client.on("user-joined", (user) => {
      // console.log("on user join");
      // console.log({ users: client.remoteUsers });
    });
    client.on("user-unpublished", (user) => {});
  };

  const handleUserJoined: THandlerUserJoined = async (user, mediaType) => {
    const client = clientRef.current as IAgoraRTCClient;

    try {
      await client.subscribe(user, mediaType);

      if (mediaType === "video") {
        let player = document.getElementById(`user-${user.uid}`);
        player !== null && player.remove();
        attachVideo(user.uid as string, user.videoTrack, user.audioTrack);
        handleBrowserAudioFailed();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleUserLeft: THandleUserLeft = async (user) => {
    console.log("user leaving");
  };

  useEffect(() => {
    initClient();
    return () => {
      leaveStream();
      closeConnection();
    };
  }, []);

  return { initChannel, handleScreenShare, getAgoraUID };
};

export default useScreenShare;
