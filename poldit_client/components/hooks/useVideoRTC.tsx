import { useLazyQuery, useQuery } from "@apollo/client";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IRemoteVideoTrack,
  ILocalVideoTrack,
  ILocalAudioTrack,
  IRemoteAudioTrack,
  IAgoraRTC,
  IMicrophoneAudioTrack,
  ICameraVideoTrack,
  UID,
} from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import { User } from "_components/appTypes/appType";

import GraphResolvers from "../../lib/apollo/apiGraphStrings";
import { IUserPresence } from "./channel/useChannel";
import {
  IChannelParams,
  IStreamOptions,
  TEnableVideo,
  TOnUserPublished,
  TStartCall,
  TUseVideoStream,
  THandleStream,
  THandleVideo,
  TCloseStream,
  TInitClient,
  THandlerUserJoined,
  //   TInitWebRTC,
} from "./videoStream";

type TStartStream = (
  member: IUserPresence,
  memberChannel: string,
  isHost: boolean
) => Promise<void>;

type TJoinMultiStream = (
  channel: string,
  members: IUserPresence[]
) => Promise<void>;

type TShareScreen = (
  member: IUserPresence,
  memberChannel: string,
  isHost: boolean
) => Promise<void>;

// const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;

// const initChannelParameters = {
//   localAudioTrack: null,
//   localVideoTrack: null,
//   remoteAudioTrack: null,
//   remoteVideoTrack: null,
//   remoteUid: null,
// };

export interface IUserVideoRTCReturn {
  clientReady: Boolean;
  initClient: () => void;
  initChannel: (isHost: boolean) => Promise<void>;
  startStream: TStartStream;
  getAgoraUID: () => string | undefined;
  closeConnection: () => void;
  options: IStreamOptions;
  leaveStream: () => void;
  unsubscribeStream: (uid: string) => void;
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  leaveChannel: () => Promise<void>;
  browserAudioFailed: boolean;
  toggleBrowserAudioBtn: () => void;
  // handleScreenShare: TShareScreen;
}

type TUserVideoStream2 = (
  channel: string,
  // user: User,
  isPublisher: boolean
) => IUserVideoRTCReturn;

// const useVideoRTC: TUserVideoStream2 = (channel, user, isPublisher) => {
const useVideoRTC: TUserVideoStream2 = (channel, isPublisher) => {
  const agoraRef: any = useRef<IAgoraRTC>(null);
  const clientRef: any = useRef(null);
  const [clientReady, setClientReady] = useState(false);
  const [browserAudioFailed, setBrowserAudioFailed] = useState(false);

  const initOptions: any = {
    appId: "",
    channel,
    uid: 0,
    role: isPublisher ? "host" : "audience",
    token: "",
  };

  const [options, setOptions] = useState<IStreamOptions>(initOptions);
  let remoteUsers: any = {};
  let localTracks: any[] = [];
  let localScreenTracks:
    | ILocalVideoTrack
    | [ILocalVideoTrack, ILocalAudioTrack];

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
      let player = document.getElementById(`user-${user.uid}`);

      if (player !== null) {
        player.remove();
      }
      player = document.createElement("div");
      player.id = `user-${user.uid}`;
      player.style.width = "100%";
      player.style.height = "100%";

      const parentId = document.getElementById(user.uid as string);

      if (parentId) {
        parentId?.appendChild(player);
      } else {
        document
          .getElementById(`user-share-screen-${user.uid}`)
          ?.insertAdjacentElement("afterbegin", player);
      }

      user.videoTrack?.play(player.id);
      user.audioTrack?.play();
      handleBrowserAudioFailed();
    }
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

  const startStream = async (
    member: IUserPresence,
    memberChannel: string,
    isHost: boolean,
    streamClient?: IAgoraRTCClient
  ) => {
    const client: IAgoraRTCClient = clientRef.current ?? streamClient;

    let clientOptions: IStreamOptions = options;

    if (!clientOptions.token && !isPublisher) {
      const { data } = await getVideoCredentials({
        variables: { channel: memberChannel, uid: "", isPublisher: isHost },
      });

      clientOptions = {
        ...data.getStreamKeys,
        channel: memberChannel,
        uid: 0,
        role: isHost ? "host" : "audience",
      };
    }
    if (client.connectionState === "DISCONNECTED") {
      await client.join(
        clientOptions.appId,
        memberChannel,
        clientOptions.token
      );
    }
    if (isHost) {
      // const localAudioTrack = await (
      //   agoraRef.current as IAgoraRTC
      // ).createMicrophoneAudioTrack({ AEC: true, ANS: true });

      // const localVideoTrack = await (
      //   agoraRef.current as IAgoraRTC
      // ).createCameraVideoTrack({
      //   facingMode: "user",
      //   encoderConfig: {
      //     height: { ideal: 6000, min: 2000 },
      //     width: { ideal: 3000, min: 1000 },
      //   },
      // });

      localTracks = await (
        agoraRef.current as IAgoraRTC
      ).createMicrophoneAndCameraTracks(
        { AEC: true, ANS: true },
        {
          facingMode: "user",
          // encoderConfig: {
          //   height: { ideal: 6000, min: 2000 },
          //   width: { ideal: 3000, min: 1000 },
          // },
        }
      );

      // const localPlayer = document.createElement("div");
      // localPlayer.id = `user-${client.uid}`;
      // localPlayer.style.width = "100%";
      // localPlayer.style.height = "100%";

      const vidCtr = document.getElementById(client.uid as string);
      // let parentId:HTMLElement | null = null

      if (vidCtr) {
        const localPlayer = document.createElement("div");
        localPlayer.id = `user-${client.uid}`;
        localPlayer.style.width = "100%";
        localPlayer.style.height = "100%";
        vidCtr?.appendChild(localPlayer);
        localTracks[1].play(localPlayer.id);
      } else {
        const screenShareCtr = document.getElementById(
          `user-share-screen-${client.uid}`
        );
        screenShareCtr && localTracks[1].play(screenShareCtr.id);
        // document
        //   .getElementById(`user-share-screen-${member.agoraId}`)
        //   ?.insertAdjacentElement("afterbegin", localPlayer);
      }

      // if (member.isScreenSharing) {
      //   document
      //     .getElementById(`user-share-screen-${member.agoraId}`)
      //     ?.insertAdjacentElement("afterbegin", localPlayer);
      // } else {
      //   document.getElementById(client.uid as string)?.appendChild(localPlayer);
      // }

      // await client.publish([localAudioTrack, localVideoTrack]);
      // localVideoTrack.play(localPlayer.id);
      // localTracks[1].play(localPlayer.id);
      // localTracks[0].play();
      // localTracks[0].setMuted(true);
      await client.publish(localTracks);
      return;
    }
  };

  const getAgoraUID = () => {
    const client: IAgoraRTCClient = clientRef.current;
    return client.uid?.toString();
  };

  const toggleMic = async () => {
    const client: IAgoraRTCClient = clientRef.current;
    const mic: any = client.localTracks[1];
    await mic.setMuted(!mic.muted);
  };

  const toggleCamera = async () => {
    const client: IAgoraRTCClient = clientRef.current;
    const cam: any = client.localTracks[0];
    await cam.setMuted(!cam.muted);
  };

  const unsubscribeStream = async (uid: string) => {
    const client = clientRef.current as IAgoraRTCClient;
    const remoteUser = client.remoteUsers.find((x) => x.uid === uid);
    remoteUser && client.unsubscribe(remoteUser);
  };

  const leaveStream = () => {
    const client = clientRef.current as IAgoraRTCClient;
    localTracks.forEach((el: any) => {
      el.stop();
      el.close();
    });

    client.localTracks.length > 0 && client.unpublish();
  };

  const leaveChannel = async () => {
    await (clientRef.current as IAgoraRTCClient).leave();
  };

  const closeConnection = () => {
    const client: IAgoraRTCClient = clientRef.current;
    client.removeAllListeners();
    setClientReady(false);
    client.leave();
  };

  const handleUserLeft = async (user: IAgoraRTCRemoteUser) => {
    delete remoteUsers[user.uid];
  };

  useEffect(() => {
    initClient();
    return () => {
      leaveStream();
      closeConnection();
    };
  }, []);

  return {
    clientReady,
    initClient,
    initChannel,
    startStream,
    getAgoraUID,
    closeConnection,
    options,
    leaveStream,
    unsubscribeStream,
    toggleMic,
    toggleCamera,
    leaveChannel,
    browserAudioFailed,
    toggleBrowserAudioBtn,
    // handleScreenShare,
  };
};

export default useVideoRTC;
