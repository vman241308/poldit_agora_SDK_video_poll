import { privilegeMongo } from "./../../models/interfaces/roleInterface";
import { Request } from "express";
import { PubSub } from "graphql-subscriptions";
import {
  pollLoader,
  userLoader,
  topicLoader,
  subTopicLoader,
  answerLoader,
  chatLoader,
  replyLoader,
  internalUserLoader,
} from "../../graphql/loaders";
import { IconType } from "react-icons/lib";
// import { pubsub } from "../../graphql/middleware/index";

// export interface siteTime {
//   hour: number;
//   minutes: number;
//   seconds: number;
// }

interface ErrorMssg {
  type: string;
  message: string;
}

interface NewPollForm {
  question: string;
  topic: string;
}

// export interface timeOnPoll {
//   poll: string;
//   time: string;
// }

export interface User {
  _id: string;
  firstname?: string;
  lastname?: string;
  password?: string;
  address1?: string;
  address2?: string;
  isAppUser?: boolean;
  favorites: Favorite[];
  bio?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  appid: string;
  email?: string;
  areasOfInterest?: UserAreasInterest[];
  topicsOfInterest?: TopicsOfInterest[];
  following?: Follower[];
  followers?: Follower[];
  profilePic?: string;
  isActive?: boolean;
  registerDate?: Date;
  pollHistory?: PollHistory[];
  isMe?: boolean;
  birthDay?: string;
  pollAnswersLeft?: number;
  // timeOnSite?: siteTime;
  // timeSpentOnSite: timeOnPoll[];
}

export interface Favorite {
  favoriteId: string;
  favoriteType: string;
  _id: string;
}

export interface UserAreasInterest {
  _id: string;
  topic: string;
  topicId: string;
  subtopic: string;
  subtopicId: string;
}

export interface TopicsOfInterest {
  _id: string;
  topicId: string;
  creationDate: string;
}

export interface Role {
  role: string;
  description?: string;
  status: string;
  privileges: privilegeMongo;
}

export interface IinternalUser {
  id: string;
  email: string;
  fullName: string;
  jobTitle: string;
  accessRole: Role;
  isActive: boolean;
  password: string;
}

export interface SelectedRow {
  accessRoleId: string;
  _id: string;
  email: string;
  fullName: string;
  jobTitle: string;
  accessRole: string;
  isActive: boolean;
}

export interface Activity {
  date: string;
  activityId: string;
  type: string;
  pollId?: string;
  poll_question?: string;
  answer?: string;
  creator: string;
  topic?: string;
  subTopic?: string;
}

export interface exportFile {
  children: string;
  onExport: Function;
}

export interface GetInternalUser {
  getInternalUser: {
    appToken: string;
    internalUser: IinternalUser;
  };
}

export interface validationErrorsAdmin {
  emailErr: string;
  passwordErr: string;
}

export interface masterCatType {
  _id: string;
  active: boolean;
  selected: boolean;
  name: string;
  icon: HTMLElement;
  subCategory: {
    _id: string;
    active: boolean;
    selected: boolean;
    name: string;
    icon: HTMLElement;
  }[];
}

export interface subCatType {
  _id: string;
  active: boolean;
  selected: boolean;
  name: string;
  icon: HTMLElement;
}

interface Follower {
  _id: string;
  userId: string;
  appId: string;
  profilePic: string | undefined;
  firstname: string;
  lastname: string;
  pageLoc?: string;
  removeFlag?: string;
  isActive?: Boolean;
  pollQuestion: string;
}

export interface GetAppUser {
  getAppUserData: User;
}

export interface MainUser {
  getUserData: {
    appToken: string;
    user: User;
  };
}

// interface Reply {
//   _id: string;
//   __typename?: string;
//   reply: string;
//   comment: Comment;
//   creator?: User;
//   replyImages: string[];
//   creationDate: string;
// }

// interface Comment {
//   _id: string;
//   __typename?: string;
//   comment: string;
//   answer: Answer;
//   creator?: User;
//   commentImages: string[];
//   replies?: Reply[];
//   creationDate: string;
// }

interface Answer {
  _id: string;
  __typename?: string;
  answer: string;
  poll: PollHistory;
  comments?: Comment[];
  creator?: User;
  answerImage?: string;
  creationDate: string;
  numLikes: number;
  numDisLikes: number;
  likes: { userId: string; like: boolean }[];
  dislikes: { userId: string; dislike: boolean }[];
  rank?: string | number;
  rankScore?: number;
  multichoice?: { _id: string; answerVal: string; rank: string }[];
  multichoiceVotes?: { _id: string; userId: string; vote: string }[];
  numMultichoiceVotes?: number;
  isEditable: boolean;
  isRemoveable: boolean;
  isReported?: boolean;
  isDisabled?: boolean;
  isRemoved?: boolean;
}

export interface PollHistory {
  _id: string;
  __typename?: string;
  question: string;
  topic: ITopic;
  topics?: ITopics[];
  keywords?: string[];
  subTopics: ISubTopic[];
  creationDate: string;
  creator?: User;
  answers: Answer[];
  likes: { userId: string; like: boolean }[];
  dislikes: { userId: string; dislike: boolean }[];
  pollImages: string[];
  views?: number;
  answerCount?: number;
  parentPollId?: PollHistory[];
  auditHistory: IAuditHistory[];
  chatMssgsCount?: number;
  chatMssgs?: ChatMessage[];
  isEditable: boolean;
  pollType?: string;
  lastActivity?: string;
  isFavorite?: boolean;
  isMultipleChoice?: boolean;
  isMyPoll?: boolean;
  totalPolls?: number;
  isActive?: boolean;
  isReported?: boolean;
  likesCount?: number;
  dislikesCount?: number;
}

export interface IAuditHistory {
  _id: string;
  action: string;
  actionDate: string;
}

export interface UserDataProps {
  getUserData: {
    appToken: string;
    user: User;
  };
}

export interface AnsBoxProps {
  loading: boolean;
  answers: Answer[];
  answersLeft: number;
  handleRef: (
    refType: string,
    refObj: Answer | ChatMessage | undefined
  ) => void;
  addAnswer: AddAnswer;
  pollId: string;
  pollType: string;
  error: ApolloError | undefined;
  report: (contentId: string, contentType: string, creator: string) => void;
  submitLoading: boolean;
  isMobile?: boolean;
}
export interface PollFeedBack extends AnsBoxProps {
  isMobile: boolean;
  userList: ChatUser[];
  user: User;
  answerRef: Answer | undefined;
  chatRef: ChatMessage | undefined;
  userListloading: boolean;
  userListErr: ApolloError | undefined;
  chatData: ChatFeed;
  chatLoading: boolean;
  chatErr: ApolloError | undefined;
  chatSubscribeToMore: SubscribeToMore;
  chatFetchMore: any;
}

export interface InternalUserDataProps {
  getInternalUserData: {
    appToken: string;
    internalUser: any;
  };
}

interface PollsAll {
  polls: PollHistory[] | undefined;
}

interface CookieOptions {
  HttpOnly: boolean;
  domain?: string;
  // httpOnly: boolean;
  path?: string;
  maxAge: number;
  expires?: Date;
  // secure: boolean;
}

declare module "express" {
  interface ResponseCustom {
    setHeader: () => void;
    cookie: (name: string, value: string, options: CookieOptions) => void;
  }
}

declare module "express" {
  interface Request {
    headers?: {
      cookie?: string;
    };
  }
}

interface ApolloSeverContext {
  req: Request;
  res: ResponseCustom;
  isAuth: {
    auth: boolean;
    id: string | null | undefined;
  };
  dataLoaders:
    | ReturnType<typeof userLoader>
    | ReturnType<typeof pollLoader>[]
    | ReturnType<typeof topicLoader>
    | ReturnType<typeof subTopicLoader>[]
    | ReturnType<typeof chatLoader>[]
    | ReturnType<typeof replyLoader>[]
    | ReturnType<typeof answerLoader>[]
    | ReturnType<typeof internalUserLoader>;
  pubsub: PubSub;
}

interface IHTMLElementForm extends HTMLElement {
  value?: string;
}

export interface ResolverMap {
  [key: string]: {
    [key: string]: Resolver | SubscriptionResolver;
  };
}

interface SubscriptionResolver {
  [key: string]: Resolver;
}

type Resolver = (
  parent: any,
  args: any,
  context: ApolloSeverContext,
  info: any
) => any;

interface StatesUS {
  id: string;
  name: string;
}

enum MsgTyp {
  Error,
  AppMsg,
}

interface AppMssg {
  msgType?: MsgTyp;
  message?: string;
}

interface CategoryItems {
  _id: string;
  category: string;
  // creator: string;
  description: string;
  active: boolean;
  linkedCats?: any;
}

interface IProps {
  title: string;
  children?: React.ReactNode;
  customStyle?: any;
}

interface NavProps {
  title: string;
}

interface ModerationResults {
  moderationType: string;
  sexuallyExplicitCat: number;
  sexuallySugestiveCat: number;
  offensiveLangCat: number;
  terms: ModerationTerm[];
  language: string;
  reviewRecommended: boolean;
  blockContent: boolean;
}

interface ModerationTerm {
  index: number;
  originalIndex: number;
  listId: number;
  term: string;
}

interface ITopic {
  _id: string;
  topic: string;
  image?: string;
  description: string;
  numPolls?: number;
  creator?: User;
  subTopics?: ISubTopic[];
  active?: Boolean;
}

interface ISubTopic {
  _id: string;
  subTopic: string;
  description: string;
  topic: ITopic;
  creator?: User;
  active?: Boolean;
  numPolls?: number;
}

interface SelectedTopic {
  id: string;
  topic: string;
}

interface SelectedSubTopic {
  id: string;
  subTopic: string;
  new?: boolean;
}

interface SelectedImage {
  userId?: string;
  id?: string;
  image: string | Blob;
  imageUri?: string;
  imageName: string;
  imgType?: string;
  entityKey?: string;
}

interface IPollChatBox {
  pollId: string;
  appUser?: User | null;
  pollUsers?: User[];
  data?: ChatMessage[];
  userList?: User[];
  currentUsers?: User[];
  updateUsers?: (userList: User[]) => void;
  addAnswer?: (answer: string, aswerImgs: SelectedImage[]) => void;
  addError?: (errMssg?: string) => void;
  showSection?: boolean;
  user?: User | null;
}

interface ChatMessage {
  _id: string;
  message: string;
  isActive: boolean;
  creator: User;
  poll: PollHistory;
  creationDate: string;
  likes: ChatLikes[];
  dislikes: ChatDisLikes[];
  hearts: Heart[];
  laughs: Laugh[];
  sadFaces: SadFace[];
  angryFaces: AngryFace[];
  chatImages?: string[];
  msgRef?: ChatMessage;
  ansRef?: Answer;
  isReported?: boolean;
}

interface ChatLikes {
  _id: string;
  userId: string;
  like: boolean;
  likeDate: string;
}

interface ChatDisLikes {
  _id: string;
  userId: string;
  dislike: boolean;
  disLikeDate: string;
}

interface Heart {
  _id: string;
  userId: string;
  heart: boolean;
  heartDate: string;
}

interface Laugh {
  _id: string;
  userId: string;
  laugh: boolean;
  laughDate: string;
}

interface SadFace {
  _id: string;
  userId: string;
  sadFace: boolean;
  sadFaceDate: string;
}

interface AngryFace {
  _id: string;
  userId: string;
  angryFace: boolean;
  angryFaceDate: string;
}

interface ChatUser {
  id: string;
  appid: string;
  followers: User[];
  numPolls: number;
  fullName: string;
  profilePic?: string;
  numAnswers: number;
  lastChatMssgDate: string;
  isActive: Boolean;
  isFollowed: Boolean;
  remove?: Boolean;
  pollId?: string;
}

interface SliderSettings {
  className?: string;
  centerMode?: boolean;
  infinite: boolean;
  centerPadding?: string;
  slidesToShow: number;
  slidesPerRow?: number;
  speed: number;
  rows?: number;
  slidesToShow: number;
  slidesToScroll?: number;
  dots?: boolean;
  arrows?: boolean;
  nextArrow?: JSX.Element;
  prevArrow?: JSX.Element;
  dotsClass?: string;
  customPaging?: (i: number) => JSX.Element;
  appendDots?: (vals: object[]) => JSX.Element;
}

interface ProfileType {
  type: string;
  active: boolean;
  loading: boolean;
  numCount?: number;
  data: PollHistory[] | UserFavorites;
  error?: string;
}

interface SearchResults {
  question: { count: number; question: PollHistory[] };
  answer: { count: number; answer: Answer[] };
  topic: { count: number; topic: ITopic[] };
  subTopic: { count: number; topic: ISubTopic[] };
}

interface UserFavorites {
  favoritePolls: PollHistory[];
  favoriteAnswers: Answer[];
}

interface CategoryItems {
  _id: string;
  category: string;
  // creator: string;
  description: string;
  active: boolean;
  linkedCats?: any;
}

interface PollsWindow {
  data: CategoryItems[];
  loading?: boolean;
  search?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // loadPolls: (catType: string, catId: string) => void;
  select: (activeId: string, catType: string, topic?: string) => void;
}

export interface CustomBtn {
  active: boolean;
  btnName: string;
  data: any[];
}

interface ChatFeed {
  cursor: string;
  messages: ChatMessage[];
  hasMoreData: boolean;
  totalMssgs: number;
}

interface SrchCustomBtn extends CustomBtn {
  count: number;
  data: PollHistory[] | Answer[] | ITopic[] | ISubTopic[] | null;
}

interface UserNotification {
  _id: string;
  message: string;
  collectionType: string;
  collectionId: string;
  parentCollectionId?: PollHistory;
  creator: User;
  creationDate: string;
  read?: boolean;
}

interface NotificationFeed {
  cursor: string;
  userId: string;
  totalUnreadNotifications: number;
  notifications: UserNotification[];
  hasMoreData: boolean;
}

interface AreaOfKnowledge {
  _id: string;
  creator: User;
  creationDate: string;
  areaKnowledge: string;
  isActive?: boolean;
}

interface MyAreaOfKnowledge {
  _id: string;
  areaKnowledgeId: string;
  downVotes: string[];
  upVotes: string[];
  totalDownVotes: number;
  totalUpVotes: number;
  areaknowledge_data: AreaOfKnowledge;
}

export type SubscribeToMore = <
  TSubscriptionData = any,
  TSubscriptionVariables = {
    cursor: string;
    pollId: string | string[] | undefined;
    limit: number;
  }
>(
  options: SubscribeToMoreOptions<
    any,
    TSubscriptionVariables,
    TSubscriptionData
  >
) => () => void;
