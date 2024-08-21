import { model, models, Schema } from "mongoose";
import IRemovedRecords from "./interfaces/removedRecords";

const removedRecordsSchema: Schema = new Schema({
  removalType: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  removalDate: {
    type: String,
    required: false,
    default: new Date().toDateString(),
  },
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});

export default models.RemovedRecords ||
  model<IRemovedRecords>("RemovedRecords", removedRecordsSchema);
