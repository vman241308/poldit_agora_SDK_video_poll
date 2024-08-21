import { Document } from "mongoose";

interface MongoDoc extends Document {
  _doc: any;
}

export default interface IUserLoc extends MongoDoc {
  collectionDate: Date;
  city: String;
  country_code: String;
  country_name: String;
  ip: String;
  latitude: String;
  longitude: String;
  region: String;
  region_code: String;
  timezone: String;
  version: String;
  user: String;
}
