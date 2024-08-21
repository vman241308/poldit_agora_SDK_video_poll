import {
  IAgoraRTC,
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  ILocalTrack,
  ILocalVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";
import {
  IMediaTrack,
  IUserPresence,
  TPublishToChannel,
} from "../channel/useChannel";

// type TInitClient = (userId: string) => Promise<string>;
type TInitClient = () => void;
type TClientType = "video" | "screen";

interface IChannelIds {
  uid: string;
  token: string;
}

interface IUserSessionData {
  [key: string]: { isHost: boolean; divId: string };
}

type TInitChannel = (
  clientType: TClientType,
  isHost: boolean,
  userId?: string
) => Promise<IChannelIds | undefined>;

type TLeaveChannel = (clientType: TClientType) => void;

type THandleListeners = (client: IAgoraRTCClient) => void;
type TMediaType = "audio" | "video";
type TStreamType = "video" | "screen" | "audio";
type TVideoTrack = ICameraVideoTrack | ILocalVideoTrack | IRemoteVideoTrack;

type THandlerUserJoined = (
  user: IAgoraRTCRemoteUser,
  mediaType: TMediaType,
  client: IAgoraRTCClient
) => void;

type TPublishStream = (streamType: TStreamType) => Promise<void>;

type TAttachLocalVideo = (uid: string, videoTrack?: TVideoTrack) => void;
type TAttachRemoteVideo = (uid: string, videoTrack: IRemoteVideoTrack) => void;

type THandleUserUnpublished = (
  user: IAgoraRTCRemoteUser,
  mediaType: TMediaType
) => void;

type TLiveSteamRecord = (
  channelId: string,
  userId: string,
  token: string,
  isRecording: boolean
) => Promise<void>;

type TGetMediaDivs = (uid: string) => IMediaDivs;

type TIsTrackOpen = (streamType: TStreamType) => boolean;

interface TMediaTrackPublishedStatus {
  video: boolean;
  screen: boolean;
  audio: boolean;
}

interface IMediaDivs {
  streamType: TClientType;
  parentVidCtr: HTMLElement | null;
  miniVidCtr: HTMLElement | null;
  videoDiv: HTMLElement | null;
  screenDiv: HTMLElement | null;
}

type TEnableVideoControls = (videoTrack: TVideoTrack) => void;
type TGetMediaTrackStatus = () => TMediaTrackPublishedStatus;

type THandleClientListeners = (
  track: ILocalVideoTrack | ICameraVideoTrack,
  publishToChannel: TPublishToChannel,
  user: IUserPresence
) => void;

type TStartStream = (
  streamTypes: TStreamType[],
  publishToChannel: TPublishToChannel,
  user: IUserPresence
) => Promise<void>;

type TStartDeviceStream = (
  publishToChannel: TPublishToChannel,
  user: IUserPresence
) => Promise<void>;

type TStopStream = (streamType?: TStreamType) => Promise<void>;
type TToggleDevice = () => Promise<void>;

interface IClientDetails {
  getMediaTrackStatus: TGetMediaTrackStatus;
  // isTrackOpen: TIsTrackOpen;
}

type TUseLiveStream = (
  channel: string,
  userId: string
  // isPublisher: boolean,
  // sendChannelMsg: TPublishToChannel
) => IUserLiveStreamReturn;

interface IUserLiveStreamReturn {
  clientReady: boolean | undefined;
  initClient: TInitClient;
  enterChannel: TInitChannel;
  leaveChannel: TLeaveChannel;
  startMediaStream: TStartStream;
  startScreenStream: TStartDeviceStream;
  publishMediaStream: TPublishStream;
  stopStream: TStopStream;
  handleLiveStreamRecording: TLiveSteamRecord;
  toggleCamera: TToggleDevice;
  toggleMic: TToggleDevice;
  clientDetails: IClientDetails;
}
