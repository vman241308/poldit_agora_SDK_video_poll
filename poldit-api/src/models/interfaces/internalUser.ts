import { Document } from "mongoose";
import RoleInterface from "./roleInterface";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface IinternalUsers extends MongoDoc {
  email: string;
  fullName: string;
  jobTitle: string;
  accessRole?: RoleInterface;
  isActive: boolean;
  password: string;
  isDisabled: Boolean;
}
