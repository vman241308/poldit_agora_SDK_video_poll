import { PollHistory, User } from "_components/appTypes/appType";
import { IModalProps } from "../../pageComponents/Poll/Video/video";
import { IUserLiveStreamReturn, TClientType } from "../media/media";
import { IUserVideoRTCReturn } from "../useVideoRTC";
import { IUseScreenShareResult } from "../videoStream";
import { Types } from "ably";

interface IUserPresence {
  uid: string;
  appid: string;
  profilePic: string | undefined;
  firstname: string | undefined;
  lastname: string | undefined;
  isMod: boolean;
  onPanel: boolean;
  pollStarted: boolean;
  isStreaming?: boolean;
  showCam?: boolean;
  muteMic?: boolean;
  isScreenSharing?: boolean;
  agoraId?: string;
  screenAgoraId?: string;
  requestInvite?: boolean;
  modMuteMic?: boolean;
  modMuteCam?: boolean;
  token?: string;
  // localAudioTrack?: ILocalAudioTrack | null;
  // localVideoTrack?: ILocalVideoTrack | null;
  // remoteAudioTrack?: IRemoteAudioTrack | null;
  // remoteVideoTrack?: IRemoteVideoTrack | null;
}
type TMsgType = "remove" | "leave";
type TContentType = "question" | "answer" | "chat";

interface IBroadCastData {
  _id: string;
  contentType: TContentType;
  remove?: boolean;
}

interface IModalContent {
  title: string;
  mssg: string;
  handler: any;
}

type TtogglePoll = (state: "start" | "end", val: boolean) => void;
type TUpdatePanel = (panel: IUserPresence[]) => void;

type THandlePollInProgress = (
  pollCreatorId: string,
  channel: Types.RealtimeChannelCallbacks,
  members: Types.PresenceMessage[],
  togglePoll: TtogglePoll,
  liveStream: IUserLiveStreamReturn,
  updatePanel: TUpdatePanel
) => void;

type EnumModMssg =
  | "mute"
  | "video"
  | "screen_share"
  | "remove_panel"
  | "end_poll";

interface IModerator extends IUserPresence {
  modMssg: EnumModMssg;
  panel: IUserPresence[];
}

interface IMediaTrack {
  [key: string]: string;
}

type TRemovePanelMember = (user: IUserPresence, msgType: TMsgType) => void;
type TTogglePoll = (user: IUserPresence, pollStarted: boolean) => void;
type TBroadcastContent = (data: IBroadCastData) => void;
type TStartPollAsAdmin = (msg: string, user?: IUserPresence) => void;
type TLeavePoll = (user: IUserPresence) => void;

type TPublishToChannel = (
  mssg: string,
  data: IUserPresence | IBroadCastData | IModerator | undefined
) => void;

type TUseMsgChannel = (
  //   channelId: string,
  channelData: PollHistory,
  user: User,
  isMod: boolean,
  liveStream: IUserLiveStreamReturn
) => IUseMsgChannelReturn;

type TMssgType = "success" | "error";
type TPollMssgType = "chat" | "qa";
type TMediaType = "video" | "audio" | "screen";

type THandleDevice = (user: IUserPresence) => void;
type TStartLiveStream = (
  user: IUserPresence,
  mediaType: TMediaType
) => Promise<void>;

type TModeratorHandler = (user: IModerator) => void;
type THandleMessageTrigger = (user: string, msgType: TPollMssgType) => void;
type TOtherChannelHandler = (user: IUserPresence) => void;
// type TUpdatePanel = (user: IUserPresence) => void;
// type THandlePanel = (user: IUserPresence, onPanel: boolean) => void;
type THandleMemberInvite = (answer: boolean) => void;

type THandleShareStream = (
  user: IUserPresence,
  screenType: TClientType
) => Promise<void>;

type TGetChannelToast = (
  msgType: TMssgType,
  mssg: string,
  data: IUserPresence,
  duration: number,
  noId?: boolean
) => void;

interface IContainerMssgs {
  handleNewMssgTrigger: THandleMessageTrigger;
  closeMssgTrigger: (msgType: TPollMssgType) => void;
  newChat: boolean;
  newQA: boolean;
}

interface IStreamIndicators {
  videoLoading: boolean;
  audioLoading: boolean;
  screenLoading: boolean;
  recordLoading: boolean;
  record: boolean;
  handleScreenShare: THandleDevice;
  handleAudio: THandleDevice;
  handleVideoCamera: THandleDevice;
  handleRecording: TOtherChannelHandler;
}

interface IUseMsgChannelReturn {
  startPoll: boolean | undefined;
  startPollLoading: boolean;
  endPoll: boolean;
  updatePollHistory: (msg: string) => void;
  // closePoll: () => void;
  startPollAsAdmin: TStartPollAsAdmin;
  panelMembers: IUserPresence[];
  publishToChannel: TPublishToChannel;
  users: IUserPresence[];
  liveStream: IUserLiveStreamReturn;
  msgModalProps: IModalProps;
  handleMemberInvite: THandleMemberInvite;
  handlePanel: THandlePanel;
  broadCastData: IBroadCastData | undefined;
  // modalContent: IModalContent | undefined;
  containerMssgs: IContainerMssgs;
  stream: IStreamIndicators;
}
