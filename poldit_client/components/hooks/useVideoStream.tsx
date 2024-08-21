import { useLazyQuery, useQuery } from "@apollo/client";
import {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IRemoteVideoTrack,
  ILocalVideoTrack,
  ILocalAudioTrack,
  IRemoteAudioTrack,
  IAgoraRTC,
} from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
import { User } from "_components/appTypes/appType";
import GraphResolvers from "../../lib/apollo/apiGraphStrings";
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
  //   TInitWebRTC,
} from "./videoStream";

// const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;

const initChannelParameters = {
  localAudioTrack: null,
  localVideoTrack: null,
  remoteAudioTrack: null,
  remoteVideoTrack: null,
  remoteUid: null,
};

const useVideoStream: TUseVideoStream = (
  channel,
  uid,
  isPublisher,
  appid,
  ctrId
) => {
  const [client, setClient] = useState<IAgoraRTCClient>();
  const [options, setOptions] = useState<IStreamOptions>();
  const [channelParams, setChannelParams] = useState<IChannelParams>(
    initChannelParameters
  );
  const agoraRef: any = useRef(null);

  const [startConnection] = useLazyQuery(
    GraphResolvers.queries.GET_STREAM_KEYS
  );

  const initClient: TInitClient = async (channel, isPublisher, divId) => {
    try {
      const { data } = await startConnection({
        variables: { channel, uid: "", isPublisher },
      });
      const clientOptions = {
        ...data.getStreamKeys,
        channel,
        uid: 0,
        role: isPublisher ? "host" : "audience",
      };
      setOptions(clientOptions);
      import("agora-rtc-sdk-ng").then(({ default: AgoraRTC }) => {
        AgoraRTC.setLogLevel(3); //Used for debug mssgs on devTools
        agoraRef.current = AgoraRTC;
        const agoraEngine = AgoraRTC.createClient({
          mode: "live",
          codec: "vp8",
        });
        setClient(agoraEngine);
        startCall(agoraEngine, clientOptions, divId);

        // !isPublisher && joinStream(agoraEngine, clientOptions, divId);
        // isPublisher
        //   ? startStream(agoraEngine, clientOptions, divId)
        //   : joinStream(agoraEngine, clientOptions, divId);
      });
    } catch (err) {
      throw err;
    }
  };

  const startCall: TStartCall = async (client, options, divId) => {
    client.on("user-joined", (user) => {
      console.log("New User joined channel", user);
    });
    client.on("user-left", (user) => {
      console.log("User Left Channel", user);
    });
    // options.role === "audience" && joinStream(client, options, uid);
    client.on("user-published", async (user, mediaType) => {
      console.log("On Published triggered", { user, mediaType });
      onUserPublished(client, user, mediaType, options, divId);
    });
  };

  const onUserPublished: TOnUserPublished = async (
    client,
    user,
    mediaType,
    options,
    divId
  ) => {
    try {
      const remotePlayer = document.getElementById(divId);
      const channelParameters = channelParams;
      await client.subscribe(user, mediaType);
      if (mediaType === "video") {
        channelParameters.remoteVideoTrack =
          user.videoTrack as IRemoteVideoTrack;
        channelParameters.remoteAudioTrack =
          user.audioTrack as IRemoteAudioTrack;

        channelParameters.remoteUid = user.uid.toString();

        options.role !== "host" &&
          remotePlayer &&
          channelParameters.remoteVideoTrack.play(remotePlayer);
      }

      if (mediaType === "audio") {
        channelParameters.remoteAudioTrack =
          user.audioTrack as IRemoteAudioTrack;
        remotePlayer && channelParameters.remoteAudioTrack.stop();
      }

      setChannelParams(channelParameters);

      client.on("user-unpublished", (user) => {
        console.log(user.uid + "has left the channel");
      });
    } catch (err) {
      throw err;
    }

    client.on("user-unpublished", (user) => {
      console.log(user.uid + "has left the channel");
    });
  };

  const enableHostVideo: TEnableVideo = async (
    client,
    player,
    options,
    channelParameters
  ) => {
    try {
      await client.setClientRole(options.role);

      if (
        channelParameters.localVideoTrack !== null &&
        client.connectionState === "CONNECTED"
      ) {
        await client.publish([
          channelParameters.localAudioTrack as ILocalAudioTrack,
          channelParameters.localVideoTrack as ILocalVideoTrack,
        ]);
        console.log("host triggered enableHost");
        channelParameters.remoteVideoTrack?.stop();
        channelParameters.localVideoTrack?.play(player);
      }
    } catch (err) {
      throw err;
    }
  };

  const enableAudienceVideo: TEnableVideo = async (
    client,
    player,
    options,
    channelParameters
  ) => {
    const isRemoteUser = client.remoteUsers.some((x) => x.uid === uid);
    console.log({ isRemoteUser, channelParameters });
    if (
      channelParameters.localAudioTrack != null &&
      channelParameters.localVideoTrack != null
    ) {
      const isRemoteUser = client.remoteUsers.some((x) => x.uid === uid);
      console.log({ isRemoteUser });

      try {
        if (isRemoteUser) {
          await client.unpublish([
            channelParameters.localAudioTrack,
            channelParameters.localVideoTrack,
          ]);
          channelParameters.localVideoTrack.stop();
        }

        if (channelParameters.remoteVideoTrack != null) {
          channelParameters.remoteVideoTrack.play(player);
        }
        // await client.setClientRole(options.role);
      } catch (err) {
        throw err;
      }
    }
    // if (channelParameters.remoteVideoTrack != null) {
    //   channelParameters.remoteVideoTrack.play(player);
    // }
    await client.setClientRole(options.role);
  };

  const joinStream: THandleStream = async (client, options, userId) => {
    const channelParameters = channelParams;
    const localPlayer = document.getElementById(userId ?? ctrId);
    console.log({
      client,
      userId,
      appid,
      localPlayer,
      users: client.remoteUsers,
      options,
      ctrId,
      connectionState: client.connectionState,
    });
    // const isRemoteUser = client.remoteUsers.some((x) => x.uid === uid);

    if (localPlayer && options) {
      try {
        if (client.connectionState === "DISCONNECTED") {
          enableAudienceVideo(client, localPlayer, options, channelParameters);
          await client.join(
            options.appId,
            options.channel,
            options.token,
            options.uid
          );
        }
      } catch (err) {
        throw err;
      }
    }
  };

  const startStream: THandleStream = async (client, options, userId) => {
    const channelParameters = channelParams;

    const localPlayer = document.getElementById(userId ?? ctrId);

    if (localPlayer && options) {
      try {
        enableHostVideo(client, localPlayer, options, channelParameters);

        console.log(client.connectionState);

        client.connectionState === "DISCONNECTED" &&
          (await client.join(
            options.appId,
            options.channel,
            options.token,
            options.uid
          ));

        console.log(channelParameters);

        channelParameters.localAudioTrack = await (
          agoraRef.current as IAgoraRTC
        ).createMicrophoneAudioTrack();

        channelParameters.localVideoTrack = await (
          agoraRef.current as IAgoraRTC
        ).createCameraVideoTrack({
          facingMode: "user",
          encoderConfig: {
            height: { ideal: 6000, min: 2000 },
            width: { ideal: 3000, min: 1000 },
          },
        });

        setChannelParams(channelParameters);

        await client.publish([
          channelParameters.localAudioTrack,
          channelParameters.localVideoTrack,
        ]);
        channelParameters.localVideoTrack?.play(localPlayer);
        channelParameters.localAudioTrack?.play();
      } catch (err) {
        throw err;
      }
    }
  };

  const stopStream: TCloseStream = (client) => {
    console.log("In Stop Stream", { isPublisher, options });
    const channelParameters = channelParams;

    channelParameters.localAudioTrack?.close();
    channelParameters.localVideoTrack?.close();
    setChannelParams({
      ...channelParameters,
      localAudioTrack: null,
      localVideoTrack: null,
    });

    client.leave();
  };

  const closeConnection = () => {
    console.log("triggered close connection");
    setClient(undefined);
    client?.unpublish();
    client?.removeAllListeners();
    // if (!isPublisher) {
    //   client?.unpublish();
    //   client?.removeAllListeners();
    // }

    client && stopStream(client);
  };

  const startVideo: THandleVideo = async (client) => {
    const { localAudioTrack, localVideoTrack } = channelParams;
    const player = document.getElementById(ctrId);

    if (player) {
      localVideoTrack?.play(player);
      //   await client.publish([localAudioTrack, localVideoTrack]);
    }
  };

  const stopVideo: THandleVideo = async (client) => {
    const { localAudioTrack, localVideoTrack } = channelParams;

    localVideoTrack?.stop();
    localAudioTrack?.stop();
  };

  return {
    client,
    options,
    joinStream,
    startStream,
    stopStream,
    startVideo,
    stopVideo,
    closeConnection,
    channelParams,
    initClient,
    startCall,
  };
};

export default useVideoStream;
