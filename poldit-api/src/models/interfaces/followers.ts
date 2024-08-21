import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface IFollowers extends MongoDoc {
  _id: string;
  userId: string;
  appId: string;
  profilePic: string;
  firstname: string;
  lastname: string;
  pageLoc: string;
  isActive: Boolean;
  removeFlag: Boolean;
  isFollowed: Boolean;
  followDate: Date;
}
