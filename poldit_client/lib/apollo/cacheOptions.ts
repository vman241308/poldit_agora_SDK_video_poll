import { InMemoryCacheConfig } from "@apollo/client";
import { Reference, StoreObject } from "@apollo/client/utilities";
import { getObjList_NoDuplicates } from "_components/globalFuncs";

export const cacheOptions: InMemoryCacheConfig = {
  typePolicies: {
    Query: {
      fields: {
        // topAnswersByPoll: { merge: false },
        getFollowActivity: {
          merge: false,
        },
        getFollowerOnlyActivity: {
          merge: false,
        },
        myAreasOfKnowledge: {
          merge: false,
        },
        getFollows: {
          merge: false,
        },
        childPollsForParentPoll: {
          keyArgs: ["pollId"],
          merge(existing, incoming, { readField }) {
            let merged: any[] = [];
            existing?.polls.forEach(
              (msg: Reference | StoreObject | undefined) => {
                const created = new Date(
                  readField("creationDate", msg) as string
                );
                merged.push({
                  id: readField("_id", msg),
                  created,
                  msg,
                });
              }
            );

            incoming?.polls.forEach(
              (msg: Reference | StoreObject | undefined) => {
                const incomingId = readField("_id", msg);
                const inMerged = merged.some((msg) => incomingId === msg.id);
                if (!inMerged) {
                  const created = new Date(
                    readField("creationDate", msg) as string
                  );
                  merged.push({
                    id: readField("_id", msg),
                    created,
                    msg,
                  });
                }
              }
            );

            return {
              ...incoming,
              polls: merged
                .sort((a, b) => b.created - a.created)
                .map((item) => item.msg),
            };
          },
          read(existing, { args }) {
            if (existing) {
              return {
                ...existing,
                polls: Object.values(existing.polls),
              };
            }
          },
        },
        notificationsWithPagination: {
          merge(existing = { notifications: [] }, incoming, { readField }) {
            let merged: any[] = [];

            existing?.notifications.forEach(
              (msg: Reference | StoreObject | undefined) => {
                const created = new Date(
                  readField("creationDate", msg) as string
                );

                merged.push({
                  id: readField("_id", msg),
                  created,
                  msg,
                });
              }
            );

            incoming?.notifications.forEach(
              (msg: Reference | StoreObject | undefined) => {
                const incomingId = readField("_id", msg);
                const inMerged = merged.some((msg) => incomingId === msg.id);

                if (!inMerged) {
                  const created = new Date(
                    readField("creationDate", msg) as string
                  );
                  merged.push({
                    id: readField("_id", msg),
                    created,
                    msg,
                  });
                }
              }
            );

            return {
              ...incoming,
              notifications: merged
                .sort((a, b) => b.created - a.created)
                .map((item) => item.msg),
            };
          },

          read(existing, { args }) {
            if (existing) {
              return {
                ...existing,
                notifications: Object.values(existing.notifications),
              };
            }
          },
        },
        pollChatUsers: {
          keyArgs: ["pollId"],
          merge(existing = [], incoming, { readField }) {
            return incoming;
          },
        },
        messageFeedByPoll: {
          keyArgs: ["pollId"],
          merge(existing = { messages: [] }, incoming, { readField }) {
            let merged: any[] = [];

            existing?.messages.forEach(
              (msg: Reference | StoreObject | undefined) => {
                const created = new Date(
                  readField("creationDate", msg) as string
                );

                merged.push({
                  id: readField("_id", msg),
                  created,
                  msg,
                });
              }
            );

            incoming?.messages.forEach(
              (msg: Reference | StoreObject | undefined) => {
                const incomingId = readField("_id", msg);
                const inMerged = merged.some((msg) => incomingId === msg.id);

                if (!inMerged) {
                  const created = new Date(
                    readField("creationDate", msg) as string
                  );
                  merged.push({
                    id: readField("_id", msg),
                    created,
                    msg,
                  });
                }
              }
            );

            return {
              ...incoming,
              messages: merged
                .sort((a, b) => a.created - b.created)
                .map((item) => item.msg),
            };
          },

          read(existing, { args }) {
            if (existing) {
              return {
                ...existing,
                messages: Object.values(existing.messages),
              };
            }
          },
        },
        answersByPoll: {
          merge: false,
        },
        subTopicsPerTopic: {
          merge: false,
        },
      },
    },
    ChatMessage: {
      fields: {
        likes: {
          merge: false,
        },
        dislikes: {
          merge: false,
        },
        hearts: {
          merge: false,
        },
        laughs: {
          merge: false,
        },
        sadFaces: {
          merge: false,
        },
        angryFaces: {
          merge: false,
        },
      },
    },
    Answer: {
      fields: {
        likes: {
          merge: false,
        },
        dislikes: {
          merge: false,
        },
      },
    },
    User: {
      fields: {
        following: {
          merge: false,
        },
        followers: {
          merge: false,
        },
        areasOfInterest: { merge: false },
      },
    },
    PollQuestion: {
      fields: {
        creationDate: {
          merge: false,
        },
      },
    },
  },
};
