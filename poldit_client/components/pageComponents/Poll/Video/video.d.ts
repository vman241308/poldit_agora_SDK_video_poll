import { ApolloError } from "@apollo/client";
import { AddAnswerFn } from "pages/Polls/[id]";
import {
  Answer,
  ChatFeed,
  ChatMessage,
  SubscribeToMore,
  User,
} from "_components/appTypes/appType";
import PollQuestion from "../Question";
import { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import {
  IStreamOptions,
  IUseVideoStreamResult,
  TCloseStream,
  THandleStream,
  TInitClient,
} from "_components/hooks/videoStream";
import { IUserVideoRTCReturn } from "_components/hooks/useVideoRTC";
import { IPollsActions, THandleEditPoll } from "_components/hooks/hooks";
import {
  IUseMsgChannelReturn,
  IUserPresence,
  TPublishToChannel,
} from "_components/hooks/channel/useChannel";
import { IUserLiveStreamReturn } from "_components/hooks/media/media";

interface IVideoPoll extends PollQuestion {
  addAnswer: AddAnswerFn;
  handleRef: (
    refType: string,
    refObj: Answer | ChatMessage | undefined
  ) => void;
  user: User;
  answerRef: Answer | undefined;
  // ansLoading: boolean;
  chatRef: ChatMessage | undefined;
  chatData: ChatFeed;
  chatLoading: boolean;
  chatErr: ApolloError | undefined;
  chatSubscribeToMore: SubscribeToMore;
  chatFetchMore: any;
  liveStream: IUserLiveStreamReturn;
}

// type THandlePanel = (panelMember: IUserPresence, onPanel: boolean) => void;

interface IVideoGridProps {
  panel: IUserPresence[];
  pollId: string;
  user: User;
  msgChannel: IUseMsgChannelReturn;
  pollActions: IPollsActions;
  creator: User | undefined;
  isSideOpen: boolean;
  // updatePanel: TUpdatePanel;
  // liveStream: IUserVideoRTCReturn;
  // shareScreen: boolean;
  // chatBtns: {
  //   isChatOpen: boolean;
  //   onChatToggle: () => void;
  // };
  // qaBtns: {
  //   isOpen: boolean;
  //   onToggle: () => void;
  // };
  // liveStream: IUseVideoStreamResult;
  // client: IAgoraRTCClient | undefined;
  // options: IStreamOptions | undefined;
  // startStream: THandleStream;
  // stopStream: TCloseStream;
  // joinStream: THandleStream;
  // initClient: TInitClient
}

interface IMemberVideoProps {
  // boxHeight: string;
  member: IUserPresence;
  // channel: string;
  user: User;
  isHost: boolean;
  isCreator: boolean;
  liveStream: IUserLiveStreamReturn;
  publish: TPublishToChannel;
  isSingleMember: boolean;
  isMobile: boolean;
  // updatePanel: TUpdatePanel;
  // liveStream: IUserVideoRTCReturn;
  // liveStream: IUseVideoStreamResult;
  // client: IAgoraRTCClient | undefined;
  // options: IStreamOptions | undefined;
  // startStream: THandleStream;
  // stopStream: TCloseStream;
  // joinStream: THandleStream;
  // initClient: TInitClient;
}

interface IVideoControlProps {
  member: IUserPresence;
  // mute: boolean;
  handleMic: () => void;
  // showCam: boolean;
  handleCamera: () => void;
  // shareScreen: boolean | undefined;
  handleScreenShare: () => void;
  leave: () => void;
  // start: THandleStream;
  // stop: THandleStream;
  // leave: () => void;
  // liveStream: IUserVideoRTCReturn;
}

interface IBrowserVideoProps extends IVideoPoll {
  handleEdit: THandleEditPoll;
  userId: string;
  srchByTopicSTopic: (data: any) => void;
  pollActions: IPollsActions;
  msgChannel: IUseMsgChannelReturn;
  // msgModalProps: IModalProps;
  qaProps: IModalProps;
  chatProps: IModalProps;
  // startPoll: boolean;
  // panel: IUserPresence[];
  // liveStream: IUserVideoRTCReturn;
  // shareScreen: boolean;
}

interface IModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  isControlled: boolean;
  getButtonProps: (props?: any) => any;
  getDisclosureProps: (props?: any) => any;
}

interface IVideoHeadProps extends PollQuestion {
  handleEdit: THandleEditPoll;
  user: User;
  userId: string;
}

type THandlePanels = (panelType: "QA" | "Chat") => void;

interface IVideoBodyProps extends IBrowserVideoProps {
  // toggleQa: (props?: any) => any;
  // toggleChat: (props?: any) => any;
  // isQAOpen: boolean;
  // isChatOpen: boolean;
}
