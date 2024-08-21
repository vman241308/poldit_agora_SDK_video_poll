import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface IAnswer extends MongoDoc {
  _id: string;
  answer: string;
  poll: string;
  comments: string[];
  creator: string;
  creationDate: Date;
  likes: { userId: string; like: boolean }[];
  dislikes: { userId: string; dislike: boolean }[];
  status: string;
  rank: string;
  isDisabled: Boolean;
  answerImage: String;
  multichoice: {
    _id: string;
    answerVal: string;
    votes: number;
    rank: string;
  }[];
  multichoiceVotes: {
    _id: string;
    userId: string;
    vote: string;
  }[];
}
