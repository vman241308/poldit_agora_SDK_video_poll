import { model, models, Schema } from "mongoose";
import IContactUs from "./interfaces/contactUs";

const contactUsSchema: Schema = new Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: false,
  },
  mssg: {
    type: String,
    required: true,
  },
  mssgDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default models.ContactUs || model<IContactUs>("ContactUs", contactUsSchema);
