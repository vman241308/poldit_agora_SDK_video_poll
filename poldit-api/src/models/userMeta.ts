import { model, Schema, models } from "mongoose";
import IUserMeta from "./interfaces/user";

const UserMetaSchema = new Schema({
  collectionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  collectionType: {
    type: String,
    required: true,
  },
  collectionData: {
    type: String,
    required: false,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export default models.UserMeta || model<IUserMeta>("UserMeta", UserMetaSchema);
