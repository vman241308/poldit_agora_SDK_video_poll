import { model, models, Schema } from "mongoose";
import IareaKnowledge from "./interfaces/areaKnowledge";

const areaKnowledgeSchema: Schema = new Schema({
  areaKnowledge: {
    type: String,
    required: true,
    unique: true,
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
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});

export default models.AreaKnowledge ||
  model<IareaKnowledge>("AreaKnowledge", areaKnowledgeSchema);
