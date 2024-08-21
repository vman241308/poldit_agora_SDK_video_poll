import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface IReply extends MongoDoc {
  _id: string;
  reply: string;
  comment: string;
  replyImages: string[];
  creator: string;
  creationDate: Date;
}
