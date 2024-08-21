import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface IareaKnowledge extends MongoDoc {
  _id: string;
  areaKnowledge: string;
  creator: string;
  creationDate: Date;
  isDisabled: Boolean;
}
