import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface IContactUs extends MongoDoc {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: number;
  mssg: string;
  mssgDate: Date;
}
