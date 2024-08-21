import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface IChat extends MongoDoc {
  _id: string;
  message: string;
  chatImages: string[];
  poll: string;
  creator: string;
  creationDate: Date;
  isAnswer: Boolean;
  isDisabled: Boolean;
  msgRef?: string;
  ansRef?: string;
  mentionRef?: string;
}
