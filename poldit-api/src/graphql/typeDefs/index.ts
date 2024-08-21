import { otherTypeDefs } from "./other";
import { rootTypeDefs } from "./root";
import { internalUserTypeDefs } from "./internalUsers";
import { privilegeTypeDef } from "./privilegeTypeDef";
import { userTypeDefs } from "./user";
import { pollTypeDefs } from "./poll";
import { topicTypeDefs } from "./topic";
import { chatTypeDefs } from "./chat";
import { removedRecordsTypeDefs } from "./removedRecords";
import { moderationTypeDefs } from "./moderation";
import {internalTypeDefs} from "./internal";

const typeDefs = [
  rootTypeDefs,
  otherTypeDefs,
  internalUserTypeDefs,
  privilegeTypeDef,
  userTypeDefs,
  pollTypeDefs,
  topicTypeDefs,
  chatTypeDefs,
  removedRecordsTypeDefs,
  moderationTypeDefs,
  ...internalTypeDefs,
];

export default typeDefs;
