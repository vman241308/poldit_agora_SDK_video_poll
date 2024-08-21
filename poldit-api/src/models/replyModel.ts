import { model, models, Schema } from "mongoose";
import IReply from "./interfaces/reply";

const replySchema: Schema = new Schema({
  reply: {
    type: String,
    required: true,
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  replyImages: [
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

export default models.Reply || model<IReply>("Reply", replySchema);
