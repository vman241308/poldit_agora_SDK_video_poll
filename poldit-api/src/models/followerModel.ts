import { model, Schema, models } from "mongoose";
import IFollowers from "./interfaces/followers";

const followerSchema: Schema = new Schema({
  userId: {
    type: String,
    required: false,
  },
  appId: {
    type: String,
    required: false,
  },
  profilePic: {
    type: String,
    required: false,
  },
  pollQuestion: {
    type: String,
    required: false,
  },
  firstname: {
    type: String,
    required: false,
  },
  lastname: {
    type: String,
    required: false,
  },
  pageLoc: {
    type: String,
    required: false,
  },
  isActive: {
    type: Boolean,
    required: false,
  },
  removeFlag: {
    type: Boolean,
    required: false,
  },
  isFollowed: {
    type: Boolean,
    required: false,
  },
  followDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default models.Followers ||
  model<IFollowers>("Followers", followerSchema);
