import { Document } from "mongoose";
import { User } from "../../interfaces";

interface MongoDoc extends Document {
  _doc: any;
}

interface ModerationHistory {
  dateReported: Date;
  reporter: string;
  dateModerated: Date;
  moderator: string;
  status: string;
  notes?: string;
}

export default interface IModeration extends MongoDoc {
  _id: string;
  flagType: string;
  flagId: string;
  violator: string;
  violationCategory: string;
  history: [ModerationHistory]
}
