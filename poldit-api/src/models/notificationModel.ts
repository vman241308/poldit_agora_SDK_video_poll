import { model, Schema, models } from "mongoose";
import INotification from "./interfaces/notification";

const notificationSchema: Schema = new Schema({
  message: {
    type: String,
    required: false,
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  collectionType: {
    type: String,
    required: true,
  },
  collectionId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  // contentOwner: { type: String, required: true },
  read: { type: Boolean, required: false },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});

export default models.Notification ||
  model<INotification>("Notification", notificationSchema);
