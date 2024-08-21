import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface ISubTopic extends MongoDoc {
  _id: string;
  subTopic: string;
  description: string;
  creator: string;
  creationDate: Date;
  topic: string;
  polls: string[];
}
