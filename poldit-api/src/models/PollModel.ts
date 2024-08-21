import { model, models, Schema, Types } from "mongoose";
import IPoll from "./interfaces/poll";

const auditSchema = new Schema({
  action: { type: String, required: false },
  actionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const uidStatus = new Schema({
  uid: { type: String, required: true },
  type: { type: String, required: true },
});

const userActionsSchema = new Schema({
  userId: { type: String, required: true },
  uidStatus: { type: [uidStatus], required: true },
});

const mediaChanges = new Schema({
  streamUid: { type: String, required: true },
  state: { type: String, required: false },
  time: { type: String, required: true },
});

const pollSchema: Schema = new Schema({
  question: {
    type: String,
    required: true,
    unique: true,
  },
  topic: {
    type: Schema.Types.ObjectId,
    ref: "Topic",
  },
  topics: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
  subTopics: [
    {
      type: Schema.Types.ObjectId,
      ref: "SubTopic",
    },
  ],
  keywords: [{ type: String }],
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  pollImages: [
    {
      type: String,
    },
  ],
  pollType: {
    type: String,
    enum: ["videoPoll", "openEnded", "multiChoice"],
    default: "openEnded",
  },
  answers: [
    {
      type: Schema.Types.ObjectId,
      ref: "Answer",
    },
  ],
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  auditHistory: [auditSchema],
  parentPollId: { type: Schema.Types.ObjectId, ref: "Poll" },
  likes: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      like: {
        type: Boolean,
      },
      likedDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
  dislikes: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      dislike: {
        type: Boolean,
      },
      disLikedDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
  views: { type: Number, default: 0 },
  status: { type: String, required: false },
  chatMssgs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
  ],
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  userActions: [userActionsSchema],
  recordingTime: { type: [String], required: false },
  cloudFrontURL: { type: String, required: false },
  audioChanges: [mediaChanges],
  videoChanges: [mediaChanges],
});

pollSchema.index({ question: "text" });

// pollSchema.post("findOne", function (res, next) {
//   // Disable Chat Messages for this poll
//   model("Chat")
//     .updateMany({ isDisabled: true })
//     .where("_id")
//     .in(res.chatMssgs)
//     .exec((err, records) => {
//       // Do stuff
//     });

//   next();
// });

export default models.Poll || model<IPoll>("Poll", pollSchema);
// module.exports = models.Poll || model("Poll", pollSchema);
