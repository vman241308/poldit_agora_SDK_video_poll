import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface IUserMeta extends MongoDoc {
  collectionDate: Date;
  collectionType: String;
  collectionData: String;
  creator: String;
}
