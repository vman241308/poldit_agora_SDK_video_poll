import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface ITopic extends MongoDoc {
  _id: string;
  topic: string;
  image: string;
  description: string;
  creator: string;
  creationDate: Date;
  subTopics: string[];
  isDisabled: Boolean;
}
