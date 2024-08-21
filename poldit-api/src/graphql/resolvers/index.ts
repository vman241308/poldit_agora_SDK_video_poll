import { internalUsersResolver } from "./internalUser";
import { rolesResolver } from "./roleResolver";
import { privilegesResolver } from "./privilegesResolver";
import { userResolvers } from "./user";
import { removedRecordResolvers } from "./removedRecord";
import { pollResolvers } from "./poll";
import { chatResolvers } from "./chat";
import { topicResolvers } from "./pollCategories";
import { feedBackResolvers } from "./pollFeedBack";
import { moderationResolvers } from "./moderation";
import { otherResolvers } from "./other";
import { internalResolvers } from "./internal";

const resolvers = [
  internalUsersResolver,
  rolesResolver,
  privilegesResolver,
  userResolvers,
  removedRecordResolvers,
  pollResolvers,
  chatResolvers,
  topicResolvers,
  feedBackResolvers,
  otherResolvers,
  moderationResolvers,
  ...internalResolvers,
];

export default resolvers;
