import { model, Schema, models } from "mongoose";
import IUserLoc from "./interfaces/user";

const UserLocSchema = new Schema({
  collectionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  city: {
    type: String,
    required: false,
  },
  country_code: {
    type: String,
    required: false,
  },
  country_name: {
    type: String,
    required: false,
  },
  ip: {
    type: String,
    required: false,
  },
  latitude: {
    type: String,
    required: false,
  },
  longitude: {
    type: String,
    required: false,
  },
  region: {
    type: String,
    required: false,
  },
  region_code: {
    type: String,
    required: false,
  },
  timezone: {
    type: String,
    required: false,
  },
  version: {
    type: String,
    required: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export default models.UserLoc || model<IUserLoc>("UserLoc", UserLocSchema);
