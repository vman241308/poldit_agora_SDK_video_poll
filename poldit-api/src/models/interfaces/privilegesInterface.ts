import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface PrivilegesInterface extends MongoDoc {
  _id: string;
  privilegeName: string;
  privilegeStatus: boolean;
  isDisabled: Boolean;
}
