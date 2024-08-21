import { useLazyQuery } from "@apollo/client";
import {
  IAgoraRTC,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ILocalAudioTrack,
  ILocalVideoTrack,
} from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import {
  IStreamOptions,
  THandlerUserJoined,
  TStartScreenShare,
  TUseScreenShare,
} from "./videoStream";
import GraphResolvers from "../../lib/apollo/apiGraphStrings";
import { IUserPresence } from "./channel/useChannel";

const useScreenShare: TUseScreenShare = (
  channel,
  containerId,
  isPublisher,
  handleAgoraMssgs
) => {
  const agoraRef: any = useRef<IAgoraRTC>(null);
  const clientRef: any = useRef(null);
  const [clientReady, setClientReady] = useState(false);
  const [shareScreen, setShareScreen] = useState(false);
  const [browserAudioFailed, setBrowserAudioFailed] = useState(false);

  let playerId = `user-screen`;
  let remoteUsers: any = {};
  let localScreenTracks:
    | ILocalVideoTrack
    | [ILocalVideoTrack, ILocalAudioTrack];

  let options: IStreamOptions = {
    appId: "",
    channel,
    uid: 0,
    role: isPublisher ? "host" : "audience",
    token: "",
  };

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
    const { data } = await getVideoCredentials({
      variables: { channel, uid: "", isPublisher },
    });
    const clientOptions = {
      ...data.getStreamKeys,
      channel,
      uid: 0,
      role: isHost ? "host" : "audience",
    };

    if (client.connectionState === "DISCONNECTED") {
      await client.join(clientOptions.appId, channel, clientOptions.token);
      handleBrowserAudioFailed();
    }
  };

  const handleShare = (val: boolean) => setShareScreen(val);

  const handleListeners = async (client: IAgoraRTCClient) => {
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
    await client.subscribe(user, mediaType);

    if (mediaType === "video") {
      let player = document.getElementById(playerId);
      //   let player = document.getElementById(`user-${user.uid}`);

      if (player !== null) {
        player.remove();
      }
      player = document.createElement("div");
      player.id = playerId;
      //   player.id = `user-${user.uid}`;
      player.style.width = "100%";
      player.style.height = "100%";
      document.getElementById(containerId)?.appendChild(player);
      user.videoTrack?.play(player.id, { fit: "fill" });

      //   user.hasVideo && handleShare();
      handleBrowserAudioFailed();
    }
  };

  const isScreenShared = () => {
    const client = clientRef.current as IAgoraRTCClient;
    const remoteUsers = client.remoteUsers;
    console.log({ remoteUsers });
    console.log(remoteUsers[0].videoTrack?.isPlaying);
    return remoteUsers[0].videoTrack?.isPlaying ?? false;
  };

  const toggleBrowserAudioBtn = () =>
    setBrowserAudioFailed(!browserAudioFailed);

  const handleBrowserAudioFailed = () => {
    (agoraRef.current as IAgoraRTC).onAudioAutoplayFailed = () => {
      setBrowserAudioFailed(true);
      // console.log('triggered btn on auto play fail')
      // const btn = document.createElement("button");
      // btn.innerText = "Click me to resume audio/video playback";
      // btn.onclick = () => btn.remove();
      // player.appendChild(btn);
    };
  };

  const handleScreenShare: TStartScreenShare = async (
    channel,
    isHost,
    isScreenSharing,
    user
  ) => {
    const client: IAgoraRTCClient = clientRef.current;
    let clientOptions: IStreamOptions = options;

    if (!clientOptions.token && !isPublisher) {
      const { data } = await getVideoCredentials({
        variables: { channel, uid: "", isPublisher: isHost },
      });

      clientOptions = {
        ...data.getStreamKeys,
        channel,
        uid: 0,
        role: isHost ? "host" : "audience",
      };
    }

    if (client.connectionState === "DISCONNECTED") {
      await client.join(clientOptions.appId, channel, clientOptions.token);
    }

    //Unpublish existing shared screen track if it already exists
    client.localTracks &&  client.unpublish();

    isHost && isScreenSharing && startScreenShare(client, user);
    isHost && !isScreenSharing && stopScreenShare(client, user);
  };

  const startScreenShare = async (
    client: IAgoraRTCClient,
    user: IUserPresence | undefined
  ) => {
    try {
      localScreenTracks = await (
        agoraRef.current as IAgoraRTC
      ).createScreenVideoTrack({});
      document.getElementById(playerId)?.remove();
      // document.getElementById(`user-${client.uid}`)?.remove();
      const localPlayer = document.createElement("div");
      localPlayer.id = playerId;
      // localPlayer.id = `user-${client.uid}`;
      localPlayer.style.width = "100%";
      localPlayer.style.height = "100%";

      document.getElementById(containerId)?.appendChild(localPlayer);

      (localScreenTracks as ILocalVideoTrack).play(localPlayer.id, {
        fit: "fill",
      });


      await client.publish(localScreenTracks);
      user && handleAgoraMssgs("Screen Share Toggle", user);
    } catch (err) {
      user && handleAgoraMssgs("Screen Share Cancelled", user);
    }
  };

  const stopScreenShare = async (
    client: IAgoraRTCClient,
    user: IUserPresence | undefined
  ) => {
    const localTrack = localScreenTracks as ILocalVideoTrack;
    localTrack.stop();
    localTrack.close();
    document.getElementById(playerId)?.remove();
    client.unpublish();
    user && handleAgoraMssgs("Screen Share Toggle", user);
  };

  const handleUserLeft = async (user: IAgoraRTCRemoteUser) => {
    delete remoteUsers[user.uid];
  };

  const closeConnection = () => {
    const client: IAgoraRTCClient = clientRef.current;
    client.removeAllListeners();
    setClientReady(false);
    client.leave();
  };

  const leaveStream = () => {
    if (localScreenTracks && Array.isArray(localScreenTracks)) {
      localScreenTracks.forEach((el: any) => {
        el.stop();
        el.close();
      });
      return;
    }
    if (localScreenTracks) {
      localScreenTracks.stop();
      localScreenTracks.close();
    }
  };

  useEffect(() => {
    initClient();
    return () => {
      leaveStream();
      closeConnection();
    };
  }, []);

  return { handleScreenShare, handleShare, shareScreen };
};

export default useScreenShare;
