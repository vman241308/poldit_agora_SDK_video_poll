import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

interface IAuditHistory {
  action: string;
  actionDate: string;
}

interface IUidStatus {
  uid: string;
  type: string;
}

interface IUserActions {
  userId: string;
  uidStatus: IUidStatus[];
}

export default interface IPoll extends MongoDoc {
  _id: string;
  question: string;
  topic: string;
  topics: string[];
  subTopics: string[];
  keywords: string[];
  pollImages: string[];
  pollType: string;
  likes: { userId: string; like: boolean }[];
  dislikes: { userId: string; dislike: boolean }[];
  answers: string[];
  creator: string;
  creationDate: Date;
  parentPollId: string;
  views: number;
  status: string;
  chatMssgs: string[];
  isDisabled: Boolean;
  auditHistory: IAuditHistory[];
  userActions: IUserActions[];
  recordingTime: string[];
  cloudFrontURL: string;
  audioChanges: { streamUid: string; state: string; time: string }[];
  videoChanges: { streamUid: string; state: string; time: string }[];
}
