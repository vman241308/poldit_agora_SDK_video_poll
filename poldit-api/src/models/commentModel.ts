import { model, models, Schema } from "mongoose";
import IComment from "./interfaces/comment";

const commentSchema: Schema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  answer: {
    type: Schema.Types.ObjectId,
    ref: "Answer",
  },
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "Reply",
    },
  ],
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  commentImages: [
    {
      type: String,
    },
  ],
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default models.Comment || model<IComment>("Comment", commentSchema);
