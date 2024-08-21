import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface IRemovedRecords extends MongoDoc {
  _id: string;
  removalType: string;
  content: string;
  removalDate: string;
}
