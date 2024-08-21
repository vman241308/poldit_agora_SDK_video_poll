import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface IComment extends MongoDoc {
  _id: string;
  comment: string;
  answer: string;
  replies: string[];
  commentImages: string[];
  creator: string;
  creationDate: Date;
}
