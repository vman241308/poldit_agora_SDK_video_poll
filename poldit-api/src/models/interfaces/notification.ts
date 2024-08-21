import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface INotification extends MongoDoc {
  _id: string;
  message: string;
  creationDate: Date;
  collectionType: string;
  collectionId: string;
  parentCollectionId: string;
  creator: string;
  read: boolean;
  isDisabled: Boolean;
}
