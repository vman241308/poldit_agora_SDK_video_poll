import IFollowers from "../../models/interfaces/followers";
import IModeration from "../../models/interfaces/moderation";

export type BatchInternalUser = (
  ids: readonly string[]
) => Promise<IinternalUsers[]>;
export type BatchAreas = (ids: readonly string[]) => Promise<IareaKnowledge[]>;
export type BatchPolls = (ids: readonly string[]) => Promise<IPoll[]>;
export type BatchUser = (ids: readonly string[]) => Promise<IUser[]>;
export type BatchTopics = (ids: readonly string[]) => Promise<ITopic[]>;
export type BatchAnswers = (ids: readonly string[]) => Promise<IAnswer[]>;
export type BatchChats = (ids: readonly string[]) => Promise<IChat[]>;
export type BatchSubTopics = (ids: readonly string[]) => Promise<ISubTopic[]>;
export type BatchNotifications = (
  ids: readonly string[]
) => Promise<INotification[]>;

export type BatchPrivileges = (
  ids: readonly string[]
) => Promise<PrivilegesInterface[]>;

export type BatchModerations = (
  ids: readonly string[]
) => Promise<IModeration[]>;

export type BatchReplies = (ids: readonly string[]) => Promise<Ireply[]>;
