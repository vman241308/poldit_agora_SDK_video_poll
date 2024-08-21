import { model, models, Schema } from "mongoose";
import IModeration from "./interfaces/moderation";

const moderationSchema: Schema = new Schema({
  flagType: {
    type: String,
    enum: ["Answer", "Chat", "Poll"],
    required: true,
  },
  flagId: {
    type: Schema.Types.ObjectId,
    refPath: "flagType",
  },
  violator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // reporter: {
  //   type: Schema.Types.ObjectId,
  //   ref: "User",
  //   required: true,
  // },
  // status: {
  //   type: String,
  //   required: false,
  // },
  // notes: {
  //   type: String,
  //   required: false,
  // },
  // moderator: {
  //   type: Schema.Types.ObjectId,
  //   ref: "InternalUsers",
  //   required: false,
  // },

  violationCategory: { type: String, required: true },
  // reportedDate: {
  //   type: Date,
  //   required: true,
  //   default: Date.now,
  // },
  // dateModerated: {
  //   type: Date,
  //   required: false,
  // },
  history: [
    {
      dateReported: {
        type: Date,
        required: true,
        default: Date.now,
      },
      reporter: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      dateModerated: {
        type: Date,
        required: false,
      },
      moderator: {
        type: Schema.Types.ObjectId,
        ref: "InternalUsers",
        required: false,
      },
      status: {
        type: String,
        required: false,
      },
      notes: {
        type: String,
        required: false,
      },
    },
  ],
});

export default models.Moderation ||
  model<IModeration>("Moderation", moderationSchema);
