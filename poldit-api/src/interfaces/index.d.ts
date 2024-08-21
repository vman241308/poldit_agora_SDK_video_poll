import { privilegeMongo } from "../models/interfaces/roleInterface";
import { Request, Response } from "express-serve-static-core";
// import { PubSub } from "graphql-subscriptions";
// import { GooglePubSub } from "@axelspringer/graphql-google-pubsub";
// import { PubSub } from "@google-cloud/pubsub";
import {
  userLoader,
  pollLoader,
  internalUserLoader,
  topicLoader,
  batchAnswers,
  batchChats,
} from "../graphql/loaders/index";
import { AnyArray } from "mongoose";

export interface ResolverMap {
  [key: string]: {
    [key: string]: Resolver | SubscriptionResolver;
  };
}

export type SortBy = "newest" | "mostLiked" | "mostDisliked" | "numAnswers";

export interface SubscriptionResolver {
  [key: string]: Resolver;
}

export type Resolver = (
  parent: any,
  args: any,
  context: ApolloSeverContext,
  info: any
) => any;

export interface ApolloSeverContext {
  req: Request;
  res: Response;
  // isAuth: {
  //   auth: boolean;
  //   id: string | null | undefined;
  // };
  isAuth: any;
  dataLoaders:
    | ReturnType<typeof internalUserLoader>
    | ReturnType<typeof userLoader>
    | ReturnType<typeof pollLoader>[]
    | ReturnType<typeof topicLoader>
    | ReturnType<typeof subTopicLoader>[]
    | ReturnType<typeof chatLoader>[]
    | ReturnType<typeof replyLoader>[]
    | ReturnType<typeof answerLoader>[];
  // pubsub: GooglePubSub;
  // dataLoaders:
  //   | ReturnType<typeof internalUserLoader>
  //   | ReturnType<typeof userLoader>
  //   | ReturnType<typeof topicLoader>
  //   | ReturnType<typeof batchChats>
  //   | ReturnType<typeof batchAnswers>;
  // pubsub: PubSub;
}

export interface ResponseCustom {
  setHeader: () => void;
  cookie: (name: string, value: string, options: CookieOptions) => void;
}

export interface CookieOptions {
  HttpOnly: boolean;
  domain?: string;
  // httpOnly: boolean;
  path?: string;
  maxAge: number;
  expires?: Date;
  // secure: boolean;
}

export interface siteTime {
  hour: number;
  minutes: number;
  seconds: number;
}

interface ErrorMssg {
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

export interface User {
  _id: string;
  firstname?: string;
  lastname?: string;
  password?: string;
  address1?: string;
  address2?: string;
  isAppUser?: boolean;
  bio?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  appid: string;
  email?: string;
  following?: Follower[];
  profilePic?: string;
  registerDate?: Date;
  pollHistory?: PollHistory[];
  // timeOnSite?: siteTime;
  // timeSpentOnSite: timeOnPoll[];
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

export interface adminUserDataForm {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  homeAddress: string;
  jobTitle: string;
  accessRole: {
    value: string;
    _id: string;
  };
  groups: string;
  lastSignIn: string;
  isActive: boolean;
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

export interface adminLeftSidebarType {
  // userId: string;
  data: any;
  loadingChecks: any;
  setLoadingChecks: Function;
  mastercategory: any;
  setmastercategory: Function;
}

interface Follower {
  _id: string;
  appId: string;
  profilePic: string | undefined;
  fistname: string;
  lastname: string;
  pageLoc?: string;
  isActive: boolean;
  remove?: boolean;
  pollQuestion?: string;
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
  answerImages?: string[];
  creationDate: string;
  likes: { userId: string; like: boolean }[];
  dislikes: { userId: string; dislike: boolean }[];
  rank?: string | number;
  multiChoice?: { answerVal: string }[];
}

export interface PollHistory {
  _id: string;
  __typename?: string;
  question: string;
  topic: any;
  subTopics: any[];
  creationDate: string;
  creator?: User;
  answers: Answer[];
  pollImages: string[];
  views?: number;
  chatMssgs?: ChatMessage[];
}

export interface UserDataProps {
  getUserData: {
    appToken: string;
    user: User;
  };
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

interface IHTMLElementForm extends HTMLElement {
  value?: string;
}

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
  children?: any;
}

interface NavProps {
  title: string;
}

export interface ChatUser {
  id: string;
  appid: string;
  followers: number;
  numPolls: number;
  profilePic?: string;
  numAnswers: number;
  lastChatMssgDate: string;
  isActive: Boolean;
  isFollowed: Boolean;
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
  description: string;
  creator: User;
  subTopics?: ISubTopic[];
  active?: Boolean;
  pollCount?: number;
}

interface ISubTopic {
  _id: string;
  subTopic: string;
  description: string;
  topic: ITopic;
  creator: User;
  active?: Boolean;
  pollCount?: number;
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
  creator: User;
  poll: PollHistory;
  creationDate: string;
  chatImages?: string[];
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
  // slidesToShow: number;
  slidesToScroll?: number;
  dots?: boolean;
  arrows?: boolean;
  nextArrow?: any;
  prevArrow?: any;
  dotsClass?: string;
  customPaging?: (i: number) => any;
  appendDots?: (vals: object[]) => any;
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

interface AdminLeftSideBarCategoryItems {
  _id: string;
  name: string;
  categoryOf: string;
  haveCats: boolean;
  active: boolean;
  selected: boolean;
}

interface PollsWindow {
  data: CategoryItems[];
  loading?: boolean;
  search?: (e: any) => void;
  // loadPolls: (catType: string, catId: string) => void;
  select: (activeId: string, catType: string, topic?: string) => void;
}

interface CustomBtn {
  active: boolean;
  btnName: string;
  data: any[any];
}

export interface ChatFeed {
  cursor: string;
  messages: ChatMessage[];
  hasMoreData: boolean;
  totalMssgs: number;
}

export interface NotificationFeed {
  cursor: string;
  notifications: UserNotification[];
  hasMoreData: boolean;
  totalUnreadNotifications: number;
}

interface SrchCustomBtn extends CustomBtn {
  count: number;
  data: PollHistory[] | Answer[] | ITopic[] | ISubTopic[] | null;
}

interface UserNotification {
  _id?: string;
  message: string;
  collectionType: string;
  collectionId: string;
  parentCollectionId?: Types.ObjectId | string;
  creator: User;
  creationDate?: string;
  read?: boolean;
}

interface UserFollower {
  _id: any;
  appId: any;
  profilePic: any;
  firstname: any;
  lastname: any;
  isActive: boolean;
  email: string;
  isFollowed: boolean | undefined;
}

interface Following {
  _id: string;
  appId: string;
  profilePic: string;
  isActive?: boolean;
  isFollowed?: boolean;
}

interface ReportItem {
  reportId: string;
  category: string;
  reporter: string;
  contentType: string;
  reportedDate: string;
  contentId: string;
  content: string;
  contentCreator: string;
  contentCreatedDate: string;
}
