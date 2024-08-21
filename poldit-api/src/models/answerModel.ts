import { model, models, Query, Schema } from "mongoose";
import IAnswer from "./interfaces/answer";

const answerSchema: Schema = new Schema({
  answer: {
    type: String,
    required: true,
  },
  poll: {
    type: Schema.Types.ObjectId,
    ref: "Poll",
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
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
  answerImage: {
    type: String,
    required: false,
  },

  rank: {
    type: String,
    default: "Not Ranked",
  },
  status: {
    type: String,
    required: false,
  },
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  multichoice: [{ answerVal: { type: String, required: false } }],
  multichoiceVotes: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      vote: {
        type: String,
      },
      voteDate: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
});

answerSchema.index({ answer: "text" });

// answerSchema.pre<IAnswer>("updateOne", async function (next) {
//   // console.log("The thing that is modified is -->", this.getUpdate());

//   const modifiedField = await this?.likes;

//   console.log("updated likes is-->", modifiedField);

//   // say that process is complete now you can go
//   // next();
// });

export default models.Answer || model<IAnswer>("Answer", answerSchema);
