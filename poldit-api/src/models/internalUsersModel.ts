import { model, Schema, models } from "mongoose";
import IinternalUsers from "./interfaces/internalUser";

const internalUsersSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  accessRole: {
    type: Schema.Types.ObjectId,
    ref: "RolesSchema",
  },
  isActive: {
    type: Boolean,
  },
  isDisabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});

export default models.InternalUsers ||
  model<IinternalUsers>("InternalUsers", internalUsersSchema);
