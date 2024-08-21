import {
  FetchResult,
  gql,
  MutationFunctionOptions,
  OperationVariables,
  Reference,
  StoreObject,
  useMutation,
} from "@apollo/client";
import {
  GetAppUser,
  MainUser,
  PollHistory,
  IinternalUser,
  User,
  UserDataProps,
  UserNotification,
} from "../../../components/appTypes/appType";
import { initializeApollo } from "../../apollo";
import GraphResolvers from "../apiGraphStrings";

const {
  GET_USER,
  IS_FAVORITE,
  GET_POLL,
  GET_FAVORITES,
  GET_APPUSER,
  GET_POLLS_ALL,
  GET_USERPOLLS,
  SHOW_VIEWS,
  // GET_ACTIVE_CHATS,
  GET_NOTIFICATIONS_WITH_PAGINATION,
  GET_USER_UNREAD_NOTIFICATIONS,
  // GET_NEWEST_POLLS,
} = GraphResolvers.queries;

export const updateUserProfile = async (
  updateFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  formInputs: string
) => {
  const formObj: User = JSON.parse(formInputs);
  try {
    await updateFunc({
      variables: { formInputs },
      update(cache, { data: { updateUser } }) {
        const user: any = cache.readQuery({
          query: GET_APPUSER,
          variables: { userId: formObj.appid },
        });

        const updatedUser = Object.assign({}, user.getAppUserData, formObj);

        cache.writeQuery({
          query: GET_APPUSER,
          variables: { userId: formObj.appid },
          data: { getAppUserData: updatedUser },
        });
      },
    });
  } catch (err) {
    throw err;
  }
};

export const addFollow = async (
  followFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  userId: string
) => {
  try {
    await followFunc({
      variables: { userId },
      update(cache, { data: { addFollow } }) {
        const user: any = cache.readQuery({
          query: GET_USER,
        });

        cache.modify({
          id: cache.identify(user?.getUserData.user),
          fields: {
            following(cachedData = [], { readField }) {
              const newFollowRef = cache.writeFragment({
                data: addFollow,
                fragment: gql`
                  fragment AddFollow on Following {
                    _id
                    appId
                    profilePic
                  }
                `,
              });

              return [...cachedData, newFollowRef];
            },
          },
        });
      },
    });
  } catch (err) {
    throw err;
  }
};

export const removeFollow = async (
  followFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  userId: string
) => {
  try {
    await followFunc({
      variables: { userId },
      update(cache, { data: { removeFollow } }) {
        const user: any = cache.readQuery({
          query: GET_USER,
        });

        cache.modify({
          id: user?.getUserData._id,
          fields: {
            following(cachedData, { readField }) {
              return cachedData.filter(
                (itemRef: StoreObject | Reference | undefined) =>
                  removeFollow._id !== readField("_id", itemRef)
              );
            },
          },
        });

        cache.evict(removeFollow._id);
      },
    });
  } catch (err) {
    throw err;
  }
};

export const handleFavorite = async (
  favoriteFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  favoriteType: string,
  favoriteId: string
) => {
  try {
    await favoriteFunc({
      variables: { favoriteType, favoriteId },
      update(cache, { data }) {
        const user: any = cache.readQuery({
          query: GET_USER,
        });

        const isFav: { isFavorite: boolean | null } | null = cache.readQuery({
          query: IS_FAVORITE,
          variables: { favType: favoriteType, favId: favoriteId },
        });

        isFav &&
          cache.writeQuery({
            query: IS_FAVORITE,
            variables: { favType: favoriteType, favId: favoriteId },
            data: { isFavorite: !isFav.isFavorite },
          });

        cache.modify({
          id: cache.identify(user?.getUserData.user),
          fields: {
            favorites(pastFavsRef:any = [], { readField }:any) {
              if (data.addFavorite) {
                const newFavRef = cache.writeFragment({
                  data: data.addFavorite,
                  fragment: gql`
                    fragment AddFavorite on Favorites {
                      _id
                      favoriteId
                      favoriteType
                    }
                  `,
                });

                return [...pastFavsRef, newFavRef];
              }

              // return pastFavsRef.filter(
              //   (itemRef: StoreObject | Reference | undefined) =>
              //     data.removeFavorite._id !== readField("_id", itemRef)
              // );
            },
          } as any,
        });
        // data && data.removeFavorite && cache.evict(data.removeFavorite._id);
      },
    });
  } catch (err) {
    throw err;
  }
};

export const updateViewCount = async (
  addViewFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  pollId: string
) => {
  try {
    await addViewFunc({
      variables: { pollId },
      update(cache, { data: { addView } }) {
        const poll: any = cache.readQuery({
          query: GET_POLL,
          variables: { pollId },
        });

        cache.modify({
          id: cache.identify(poll.poll),
          fields: {
            views(cachedData = 0, { readField }) {
              return (cachedData += 1);
            },
          },
        });
      },
    });
  } catch (err) {
    throw err;
  }
};

// export const addNewAnswer = async (
//   addAnswerFunc: (
//     options?: MutationFunctionOptions<any, OperationVariables> | undefined
//   ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
//   details: string,
//   pollId: string
// ) => {
//   try {
//     addAnswerFunc({
//       variables: { details },
//       update(cache, { data: { createAnswer } }) {
//         const poll: any = cache.readQuery({
//           query: GET_POLL,
//           variables: { pollId },
//         });

//         cache.modify({
//           id: cache.identify(poll.poll),
//           fields: {
//             answers(cachedAnswers = [], { readField }) {
//               const newAnswerRef = cache.writeFragment({
//                 data: createAnswer,
//                 fragment: gql`
//                   fragment CreateAnswer on Answers {
//                     _id
//                   }
//                 `,
//               });

//               return [...cachedAnswers, newAnswerRef];
//             },
//           },
//         });
//       },
//     });
//   } catch (err) {
//     throw err;
//   }
// };

// export const addNewChatMssg = async (
//   addChatMssgFunc: (
//     options?: MutationFunctionOptions<any, OperationVariables> | undefined
//   ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
//   details: string,
//   pollId: string
// ) => {
//   try {
//     addChatMssgFunc({
//       variables: { details },
//       update(cache, { data: { createMessage } }) {
//         const poll: any = cache.readQuery({
//           query: GET_POLL,
//           variables: { pollId },
//         });

//         const activeChats: any = cache.readQuery({
//           query: GET_ACTIVE_CHATS,
//         });

//         if (activeChats) {
//           let activeChatsUpdated = activeChats.activeChats.map(
//             (item: PollHistory) => {
//               if (item._id === pollId && item.chatMssgs) {
//                 const updatedChatMssgs = [...item.chatMssgs, createMessage];
//                 return { ...item, chatMssgs: updatedChatMssgs };
//               } else if (item._id === pollId && !item.chatMssgs) {
//                 return { ...item, chatMssgs: [createMessage] };
//               }

//               return item;
//             }
//           );

//           activeChatsUpdated = activeChatsUpdated.sort(
//             (a: any, b: any) => b.chatMssgs.length - a.chatMssgs.length
//           );

//           cache.writeQuery({
//             query: GET_ACTIVE_CHATS,
//             data: {
//               activeChats: activeChatsUpdated,
//             },
//           });
//         } else {
//           cache.modify({
//             id: cache.identify(poll.poll),
//             fields: {
//               chatMssgs(cachedChats = [], { readField }) {
//                 const newChatRef = cache.writeFragment({
//                   data: createMessage,
//                   fragment: gql`
//                     fragment CreateMessage on ChatMssgs {
//                       _id
//                     }
//                   `,
//                 });
//                 return [...cachedChats, newChatRef];
//               },
//             },
//           });
//         }
//       },
//     });
//   } catch (err) {
//     throw err;
//   }
// };

// export const addNewPoll = async (
//   addNewPollFunc: (
//     options?: MutationFunctionOptions<any, OperationVariables> | undefined
//   ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
//   details: string
// ) => {
//   try {
//     addNewPollFunc({
//       variables: { details },
//       update(cache, { data: { createPoll } }) {
//         const { newestPolls }: any = cache.readQuery({
//           query: GET_NEWEST_POLLS,
//         });

//         cache.writeQuery({
//           query: GET_NEWEST_POLLS,
//           data: { newestPolls: [...newestPolls, createPoll] },
//         });
//       },
//     });
//   } catch (err) {
//     throw err;
//   }
// };

export const updateNotifications = async (
  updateNotificationFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  notifId: string,
  cursor: string,
  limit: number
) => {
  try {
    updateNotificationFunc({
      variables: {
        details: notifId,
      },

      update(cache, { data: { updateNotification } }) {
        let readNotifications: UserNotification[] = [];

        const data: any = cache.readQuery({
          query: GET_NOTIFICATIONS_WITH_PAGINATION,
          variables: { cursor, limit },
        });

        let updatedTotalUnReadNotifications =
          data?.notificationsWithPagination?.totalUnreadNotifications ?? 0;

        if (notifId) {
          readNotifications =
            data?.notificationsWithPagination?.notifications.map(
              (item: UserNotification) => {
                if (item._id === notifId) {
                  return { ...item, read: true };
                }
                return item;
              }
            );
          updatedTotalUnReadNotifications -= 1;
        } else {
          readNotifications =
            data?.notificationsWithPagination?.notifications.map(
              (item: UserNotification) => {
                return { ...item, read: true };
              }
            );

          updatedTotalUnReadNotifications = 0;
        }

        cache.writeQuery({
          query: GET_NOTIFICATIONS_WITH_PAGINATION,
          variables: { cursor, limit },
          data: {
            notificationsWithPagination: {
              ...data.notificationsWithPagination,
              notifications: readNotifications,
              totalUnreadNotifications: updatedTotalUnReadNotifications,
            },
          },
        });
      },
    });
  } catch (err) {
    throw err;
  }
};
