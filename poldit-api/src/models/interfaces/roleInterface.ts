import { Document } from "mongoose";
import PrivilegesInterface from "./privilegesInterface";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface RoleInterface extends MongoDoc {
  _id: string;
  role: string;
  description: string;
  status: String;
  privileges?: [privilegeMongo];
  isDisabled: Boolean;
}

export interface privilegeMongo {
  _id: string;
  privilegeName?: string;
  privilegeStatus?: string;
}
