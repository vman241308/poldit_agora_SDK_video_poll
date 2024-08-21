import { model, models, Schema } from "mongoose";
import IChat from "./interfaces/chat";

const chatSchema: Schema = new Schema({
  message: {
    type: String,
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  poll: {
    type: Schema.Types.ObjectId,
    ref: "Poll",
  },
  chatImages: [
    {
      type: String,
    },
  ],
  isAnswer: {
    type: Boolean,
    required: true,
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  likes: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      like: {
        type: Boolean,
      },
      likeDate: {
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
      disLikeDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
  hearts: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      heart: {
        type: Boolean,
      },
      heartDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
  laughs: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      laugh: {
        type: Boolean,
      },
      laughDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
  sadFaces: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      sadFace: {
        type: Boolean,
      },
      sadFaceDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
  angryFaces: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      angryFace: {
        type: Boolean,
      },
      angryFaceDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],

  msgRef: {
    type: Schema.Types.ObjectId,
    ref: "Chat",
  },
  ansRef: {
    type: Schema.Types.ObjectId,
    ref: "Answer",
  },
  mentionRef: {
    type: String,
  },
});

export default models.Chat || model<IChat>("Chat", chatSchema);
