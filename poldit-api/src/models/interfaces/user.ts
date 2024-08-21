import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

interface Favorites {
  _id?: string;
  favoriteType: string;
  favoriteId: string;
}

interface AreasOfKnowledge {
  areaKnowledgeId: string;
  isActive: boolean;
  upVotes: { userId: string }[];
  downVotes: { userId: string }[];
}

interface Notification {
  _id: string;
  message: string;
  creationDate: Date;
  collectionType: string;
  collectionId: string;
  parentCollectionId: string;
  creator: string;
  read: boolean;
  isDisabled: Boolean;
}

export interface AreasInterest {
  _id: string;
  topicId: string;
  topic: string;
  subtopic: string;
  subtopicId: string;
}

export interface TopicsInterest {
  _id: string;
  topicId: string;
  creationDate: Date;
}

// interface pollTime {
//   poll: string;
//   hours: number;
//   minutes: number;
//   seconds: number;
//   pollCount: number;
// }

export default interface IUser extends MongoDoc {
  email: string;
  appid: string;
  firstname: string;
  lastname?: string;
  password?: string;
  address1?: string;
  address2?: string;
  bio?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  profilePic?: string;
  birthday?: string;
  loginMethod?: string;
  newUser?: boolean;
  useragreementagreed: boolean;
  following?: { appId: string; profilePic: string | undefined }[];
  registerDate: Date;
  pollHistory: string[];
  imgHistory: string[];
  favorites: Favorites[];
  status: String;
  isDisabled: Boolean;
  isEmailVerified: Boolean;
  areasOfKnowledge: AreasOfKnowledge[];
  notifications: Notification[];
  areasOfInterest: AreasInterest[];
  topicsOfInterest: TopicsInterest[];
  // timeOnSite?: {
  //   hour: number;
  //   minutes: number;
  //   seconds: number;
  // };
  // timeSpentOnPoll?: pollTime[];
}
