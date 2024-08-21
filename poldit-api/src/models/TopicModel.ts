import { model, models, Schema } from "mongoose";
import ITopic from "./interfaces/topic";

const topicSchema: Schema = new Schema({
  topic: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
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
  subTopics: [
    {
      type: Schema.Types.ObjectId,
      ref: "SubTopic",
    },
  ],
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});

export default models.Topic || model<ITopic>("Topic", topicSchema);
