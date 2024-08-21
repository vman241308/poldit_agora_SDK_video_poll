import { model, models, Schema } from "mongoose";
import ISubTopic from "./interfaces/subTopic";

const subTopicSchema: Schema = new Schema({
  subTopic: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  creationDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  topic: {
    type: Schema.Types.ObjectId,
    ref: "Topic",
  },
  polls: [
    {
      type: Schema.Types.ObjectId,
      ref: "Poll",
    },
  ],
});

export default models.SubTopic || model<ISubTopic>("SubTopic", subTopicSchema);
