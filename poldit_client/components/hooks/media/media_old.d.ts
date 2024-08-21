import {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  ConnectionState,
} from "agora-rtc-sdk-ng";

import { IUserPresence, TPublishToChannel } from "../channel/useChannel";

type TUseLiveStream = (
  channel: string,
  isPublisher: boolean,
  sendChannelMsg: TPublishToChannel
) => IUserLiveStreamReturn;

interface IStreamOptions {
  appId: string;
  channel: string;
  token: string;
  uid: string | number;
  role: "host" | "audience";
}

interface IClientDetails {
  channelName: string | undefined;
  connectionState: ConnectionState;
}

type TUseScreenShare = (
  channel: string,
  isPublisher: boolean,
  sendChannelMsg: TPublishToChannel
) => IUseScreenShareResult;

// type TInitClient = () => void;

type TInitClient = (
  userId: string
  // isStreaming: boolean,
  // isScreenSharing: boolean
  ) => Promise<TAgoraIds>;
// ) => Promise<TAgoraIds>;

type TClientType = "video" | "screen";

type TInitChannel = (
  clientType: TClientType,
  isHost: boolean,
  userId?: string
) => Promise<string | undefined>;

type THandleListeners = (client: IAgoraRTCClient) => void;
type THandleClientListeners = (
  track: ILocalVideoTrack | ICameraVideoTrack,
  user?: IUserPresence
) => void;

type TIsPlaying = (mediaType: TMediaType) => boolean;

type TMediaType = "audio" | "video";

type THandlerUserJoined = (
  user: IAgoraRTCRemoteUser,

  mediaType: TMediaType,
  client: IAgoraRTCClient
) => void;

type TToggleStream = (
  client: IAgoraRTCClient,
  user?: IUserPresence
) => Promise<void>;

type TGetClientDetails = (screenType: TClientType) => IClientDetails;

type THandleStream = (user: IUserPresence) => void;
type TStopStream = (
  user: IUserPresence,
  screenType: TClientType,
  hideMsg?: boolean
) => void;

type TCameraVideoAudioTracks = [IMicrophoneAudioTrack, ICameraVideoTrack];
type TScreenVideoWithAudioTracks = [ILocalVideoTrack, ILocalAudioTrack];
type TScreenVideoTracks = ILocalVideoTrack | TScreenVideoWithAudioTracks;

type TAttachVideo = (
  uid: string,
  videoTrack?: ICameraVideoTrack | IRemoteVideoTrack | ILocalVideoTrack,
  audioTrack?: IMicrophoneAudioTrack | IRemoteAudioTrack
) => void;

type TAgoraIds = {
  agoraId: string;
  screenAgoraId: string;
};

type TGetAgoraUID = () => TAgoraIds | undefined;
type THandleUserLeft = (user: IAgoraRTCRemoteUser) => Promise<void>;
type TShareStream = (
  isHost: boolean,
  user: IUserPresence,
  screenType: TClientType
) => Promise<void>;
type TStopStream = (clientType: TClientType, user: IUserPresence) => void;
type TLeaveStream = (clientType: TClientType) => void;
type TCloseClient = (clientId: string) => void;

interface IUserLiveStreamReturn {
  clientReady: boolean;
  initClient: TInitClient;
  initChannel: TInitChannel;
  browserAudioFailed: boolean;
  getAgoraUID: TGetAgoraUID;
  toggleBrowserAudioBtn: () => void;
  handleShareStream: TShareStream;
  stopStream: TStopStream;
  toggleMic: () => void;
  toggleCamera: () => void;
  unsubscribeStream: (uid: string) => Promise<void>;
  isPlaying: TIsPlaying;
  closeClient: TCloseClient;
  getClientDetails: TGetClientDetails;
}

interface IUseScreenShareResult {
  initChannel: TInitChannel;
  handleScreenShare: TShareStream;
  getAgoraUID: TGetAgoraUID;
}

interface IStreamOptions {
  appId: string;
  channel: string;
  token: string;
  uid: string | number;
  role: "host" | "audience";
}
