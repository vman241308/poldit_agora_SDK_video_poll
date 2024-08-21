import {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IRemoteVideoTrack,
  ILocalVideoTrack,
  ILocalAudioTrack,
  IRemoteAudioTrack,
  IAgoraRTC,
} from "agora-rtc-sdk-ng";
import { IUserPresence } from "_components/pageComponents/Poll/Video/video";

export interface IUseVideoStreamResult {
  joinStream: THandleStream;
}

// export interface IUseVideoStreamResult {
//   client: IAgoraRTCClient | undefined;
//   options: IStreamOptions | undefined;
//   joinStream: THandleStream;
//   // initWebRTC: TInitWebRTC;
//   startStream: THandleStream;
//   stopStream: TCloseStream;
//   //   joinVideo: TJoinVideo;
//   startVideo: THandleVideo;
//   stopVideo: THandleVideo;
//   closeConnection: () => void;
//   channelParams: IChannelParams;
//   initClient: TInitClient;
//   startCall: TStartCall;
// }

// export type TInitWebRTC = (
//   channel: string,
//   uid: string,
//   role: "host" | "audience"
// ) => any;

export type TUseVideoStream = (
  channel: string,
  uid: string,
  isPublisher: boolean,
  appid: string,
  ctrId: string
) => IUseVideoStreamResult;

export interface IStreamOptions {
  appId: string;
  channel: string;
  token: string;
  uid: string | number;
  role: "host" | "audience";
}

export interface IChannelParams {
  localAudioTrack: ILocalAudioTrack | null;
  localVideoTrack: ILocalVideoTrack | null;
  remoteAudioTrack: IRemoteAudioTrack | null;
  remoteVideoTrack: IRemoteVideoTrack | null;
  remoteUid: string | null;
}

export type TStartCall = (
  client: IAgoraRTCClient,
  options: StreamOptions,
  divId: string
) => void;

export type TOnUserPublished = (
  client: IAgoraRTCClient,
  user: IAgoraRTCRemoteUser,
  mediaType: "audio" | "video",
  options: StreamOptions,
  divId: string
) => void;

// export type THandleStream = () => Promise<void>;
export type THandleStream = (
  client: IAgoraRTCClient,
  options: IStreamOptions,
  userId?: string
) => void;

export type TCloseStream = (client: IAgoraRTCClient) => void;

export type THandleVideo = (client: IAgoraRTCClient) => void;

export type TEnableVideo = (
  client: IAgoraRTCClient,
  player: HTMLElement,
  options: StreamOptions,
  channelParams: ChannelParams
) => void;

export type TInitClient = (
  channel: string,
  isPublisher: boolean,
  divId: string
) => void;

type TUseScreenShare = (
  channel: string,
  containerId: string,
  isPublisher: boolean,
  handleAgoraMssgs: (mssg: string, user: IUserPresence) => void
) => IUseScreenShareResult;

interface IUseScreenShareResult {
  handleScreenShare: TStartScreenShare;
  handleShare: (val: boolean) => void;
  shareScreen: boolean;
}

type THandlerUserJoined = (
  user: IAgoraRTCRemoteUser,
  mediaType: "audio" | "video"
) => void;

type TStartScreenShare = (
  memberChannel: string,
  isHost: boolean,
  isSharing: boolean,
  user?: IUserPresence
) => Promise<void>;

