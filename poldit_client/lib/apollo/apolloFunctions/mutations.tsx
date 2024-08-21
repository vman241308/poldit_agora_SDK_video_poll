import {
  FetchResult,
  gql,
  MutationFunctionOptions,
  OperationVariables,
  Reference,
  StoreObject,
  useMutation,
} from "@apollo/client";
import { getAlphabeticalList } from "_components/globalFuncs";
import {
  AreaOfKnowledge,
  GetAppUser,
  MainUser,
  MyAreaOfKnowledge,
  PollHistory,
  User,
  UserDataProps,
} from "../../../components/appTypes/appType";
import { initializeApollo } from "../../apollo";
import GraphResolvers from "../apiGraphStrings";

const {
  GET_USER,
  IS_FAVORITE,
  GET_POLL,
  GET_FAVORITES,
  GET_APPUSER,
  GET_ANSWERS_BY_POLL,
  GET_POLLS_ALL,
  GET_USERPOLLS,
  SHOW_VIEWS,
  AREAS_OF_KNOWLEDGE,
  MY_AREAS_OF_KNOWLEDGE,
  GET_USER_PROFILE_DATA,
  GET_APP_USER_FOLLOWERS,
  GET_USER_FOR_POLL,
  GET_SUBTOPICS,
  // GET_ACTIVE_CHATS,
  // GET_NEWEST_POLLS,
  GET_SUBTOPICS_PER_TOPIC,
} = GraphResolvers.queries;

export const addNewSubTopic = async (
  addSubTopicFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  subTopicInfo: string
) => {
  const subTopicObj = JSON.parse(subTopicInfo);

  try {
    addSubTopicFunc({
      variables: { subTopicInfo },
      update(cache, { data: { createSubTopic } }) {
        const existingSubTopicsPerTopic: any = cache.readQuery({
          query: GET_SUBTOPICS_PER_TOPIC,
          variables: { topic: subTopicObj.topicVal },
        });

        const updatedSubTopics = getAlphabeticalList(
          [createSubTopic, ...existingSubTopicsPerTopic.subTopicsPerTopic],
          "subTopic"
        );

        cache.writeQuery({
          query: GET_SUBTOPICS_PER_TOPIC,
          variables: { topic: subTopicObj.topicVal },
          data: {
            subTopicsPerTopic: updatedSubTopics,
          },
        });
      },
    });
  } catch (err) {
    throw err;
  }
};

export const updateUserProfile = async (
  updateFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  formInputs: string
) => {
  const formObj: any = JSON.parse(formInputs);
  try {
    await updateFunc({
      variables: { formInputs },
      update(cache, { data: { updateUser } }) {
        const user: any = cache.readQuery({
          query: GET_APPUSER,
          variables: { userId: formObj.appid },
        });

        const updatedUser = Object.assign({}, user.getAppUserData, {
          ...formObj,
        });

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

export const addAnswer_updateLimits = async (
  updateFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  details: string
) => {
  const detailObj: any = JSON.parse(details);

  try {
    const { data } = await updateFunc({
      variables: { details },
      update(cache, { data }) {
        const user: any = cache.readQuery({
          query: GET_USER_FOR_POLL,
          variables: { pollId: detailObj.poll },
        });

        const answersLeft = user?.getUserDataForPoll?.pollAnswersLeft - 1;

        cache.writeQuery({
          query: GET_USER_FOR_POLL,
          variables: { pollId: detailObj.poll },
          data: {
            getUserDataForPoll: {
              ...user.getUserDataForPoll,
              pollAnswersLeft: answersLeft,
            },
          },
        });
      },
    });

    return data;
  } catch (err) {
    throw err;
  }
};

export const removeAnswer_updateLimits = async (
  updateFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  answerId: string,
  pollId: string
) => {
  try {
    await updateFunc({
      variables: { answerId },
      update(cache, { data }) {
        const user: any = cache.readQuery({
          query: GET_USER_FOR_POLL,
          variables: { pollId },
        });

        const answersLeft = user?.getUserDataForPoll?.pollAnswersLeft + 1;

        cache.writeQuery({
          query: GET_USER_FOR_POLL,
          variables: { pollId },
          data: {
            getUserDataForPoll: {
              ...user.getUserDataForPoll,
              pollAnswersLeft: answersLeft,
            },
          },
        });
      },
    });

    return "Success";
  } catch (err) {
    throw err;
  }
};

export const updateAreaOfKnowledge = async (
  updateFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  area: string
) => {
  try {
    await updateFunc({
      variables: { area },
      update(cache, { data: { addAreaOfKnowledge } }) {
        const areas: any = cache.readQuery({
          query: AREAS_OF_KNOWLEDGE,
        });

        const updatedAreasOfKnowledge = getAlphabeticalList(
          [...areas.areasOfKnowledge, addAreaOfKnowledge],
          "areaKnowledge"
        );

        cache.writeQuery({
          query: AREAS_OF_KNOWLEDGE,
          data: {
            areasOfKnowledge: updatedAreasOfKnowledge,
          },
        });
      },
    });
  } catch (err) {
    throw err;
  }
};

export const updateMyAreasOfKnowledge = async (
  updateFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  selectedAreas: AreaOfKnowledge[],
  appid: string
) => {
  try {
    const areas = selectedAreas.map((item) => item._id);
    await updateFunc({
      variables: { areas },
      update(cache, { data }) {
        const mySelectedAreas = selectedAreas.map((item: AreaOfKnowledge) => {
          const myArea: MyAreaOfKnowledge = {
            _id: item._id,
            areaKnowledgeId: item._id,
            areaknowledge_data: item,
            upVotes: [],
            downVotes: [],
            totalUpVotes: 0,
            totalDownVotes: 0,
          };
          return myArea;
        });

        cache.writeQuery({
          query: MY_AREAS_OF_KNOWLEDGE,
          variables: { appid },
          data: {
            myAreasOfKnowledge: mySelectedAreas,
          },
        });
      },
    });
  } catch (err) {
    throw err;
  }
};

// export const addFollow = async (
//   followFunc: (
//     options?: MutationFunctionOptions<any, OperationVariables> | undefined
//   ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
//   userId: string
// ) => {
//   try {
//     await followFunc({
//       variables: { userId },
//       update(cache, { data: { addFollow } }) {
//         const user: any = cache.readQuery({
//           query: GET_USER,
//         });

//         cache.modify({
//           id: cache.identify(user?.getUserData.user),
//           fields: {
//             following(cachedData = [], { readField }) {
//               const newFollowRef = cache.writeFragment({
//                 data: addFollow,
//                 fragment: gql`
//                   fragment AddFollow on Following {
//                     _id
//                     appId
//                     profilePic
//                   }
//                 `,
//               });

//               return [...cachedData, newFollowRef];
//             },
//           },
//         });
//       },
//     });
//   } catch (err) {
//     throw err;
//   }
// };

// export const removeFollow = async (
//   followFunc: (
//     options?: MutationFunctionOptions<any, OperationVariables> | undefined
//   ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
//   userId: string
// ) => {
//   try {
//     await followFunc({
//       variables: { userId },
//       update(cache, { data: { removeFollow } }) {
//         const user: any = cache.readQuery({
//           query: GET_USER,
//         });

//         cache.modify({
//           id: user?.getUserData._id,
//           fields: {
//             following(cachedData, { readField }) {
//               return cachedData.filter(
//                 (itemRef: StoreObject | Reference | undefined) =>
//                   removeFollow._id !== readField("_id", itemRef)
//               );
//             },
//           },
//         });

//         cache.evict(removeFollow._id);
//       },
//     });
//   } catch (err) {
//     throw err;
//   }
// };

export const handleFavorite = async (
  favoriteFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  isFav: boolean,
  favoriteType: string,
  favoriteId: string
) => {
  try {
    await favoriteFunc({
      variables: { isFav, favoriteType, favoriteId },
      update(cache, { data }) {
        cache.writeQuery({
          query: IS_FAVORITE,
          variables: { favType: favoriteType, favId: favoriteId },
          data: { isFavorite: isFav },
        });
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
  pollId: string | any
) => {
  try {
    await addViewFunc({
      variables: { pollId },
      update(cache, { data: { addView } }) {
        const poll: any = cache.readQuery({
          query: GET_POLL,
          variables: { pollId },
        });

        if (poll && poll.poll) {
          cache.modify({
            id: cache.identify(poll.poll),
            fields: {
              views(cachedData = 0, { readField }) {
                return (cachedData += 1);
              },
            },
          });
        }
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
//         console.log("created Answer:", createAnswer);
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

export const updateAnswer = async (
  updateAnswerFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  details: string
) => {
  const answerObj = JSON.parse(details);

  try {
    await updateAnswerFunc({
      variables: { details },
      update(cache, { data: { updateAnswer } }) {
        cache.writeFragment({
          id: `Answer:${answerObj._id}`,
          fragment: gql`
            fragment UpdateAnswer on AnswersByPoll {
              answer
              answerImage
            }
          `,
          data: {
            answer: answerObj.answer,
            answerImage: answerObj.answerImage,
          },
        });
      },
    });

    return "Edited successfully";
  } catch (err) {
    throw err;
  }
};

export const removeImgFromPoll = async (
  removeImgFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  details: string
) => {
  const pollObj = JSON.parse(details);

  try {
    await removeImgFunc({
      variables: { details },
      update(cache, { data }) {
        const pollData: any = cache.readQuery({
          query: GET_POLL,
          variables: { pollId: pollObj._id },
        });

        const filteredPollImgs = pollData.poll.pollImages.filter(
          (img: string) => img !== pollObj.pollImage
        );

        cache.writeQuery({
          query: gql`
            query Poll($pollId: String!) {
              poll(pollId: $pollId) {
                _id
                __typename
                pollImages
              }
            }
          `,
          data: {
            poll: {
              _id: pollObj._id,
              __typename: "PollQuestion",
              pollImages: filteredPollImgs,
            },
          },
        });
      },
    });
  } catch (err) {
    throw err;
  }
};

export const updatePoll = async (
  updatePollFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  details: string
) => {
  const pollObj = JSON.parse(details);

  try {
    await updatePollFunc({
      variables: { details },
      update(cache, { data: { updatePoll } }) {
        const pollData: any = cache.readQuery({
          query: GET_POLL,
          variables: { pollId: pollObj._id },
        });

        const pollImages =
          pollObj.pollImages.length > 0
            ? pollObj.pollImages
            : pollData.poll.pollImages;

        cache.writeQuery({
          query: gql`
            query Poll($pollId: String!) {
              poll(pollId: $pollId) {
                _id
                __typename
                question
                pollImages
              }
            }
          `,
          data: {
            poll: {
              _id: pollObj._id,
              __typename: "PollQuestion",
              question: JSON.stringify(pollObj.question),
              pollImages,
            },
          },
        });
      },
    });
  } catch (err) {
    throw err;
  }
};

export const followHandler = async (
  handleFollowFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  details: string
) => {
  const chatUser = JSON.parse(details);

  try {
    handleFollowFunc({
      variables: { details },
      update(cache, { data }) {
        cache.modify({
          id: cache.identify(chatUser),
          fields: {
            isFollowed(cachedData = false, { readField }) {
              return !cachedData;
            },
          },
        });
      },
    });
  } catch (err) {
    throw err;
  }
};

export const followHandlerForUser = (
  handleFollowFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  details: string,
  appid: string
) => {
  const followUser = JSON.parse(details);

  try {
    handleFollowFunc({
      variables: { details },
      update(cache, { data }) {
        const currentProfile: any = cache.readQuery({
          query: GET_USER_PROFILE_DATA,
          variables: { appid },
        });

        let followers = [];

        if (followUser.removeFromFollowerList) {
          followers = currentProfile.getUserProfileData.followers.filter(
            (item: any) => item._id !== followUser.removeFromFollowerList
          );
        } else {
          followers = currentProfile.getUserProfileData.followers.map(
            (item: any) => {
              if (item._id === followUser._id) {
                return { ...item, isFollowed: !item.isFollowed };
              }
              return item;
            }
          );
        }

        let following = [];

        if (followUser.isFollowed) {
          following = currentProfile.getUserProfileData.following.filter(
            (item: any) => item._id !== followUser._id
          );
        } else {
          following = [
            ...currentProfile.getUserProfileData.following,
            { ...followUser, appId: followUser.appId },
          ];
        }

        cache.writeQuery({
          query: GET_USER_PROFILE_DATA,
          variables: { appid },
          data: {
            getUserProfileData: {
              ...currentProfile.getUserProfileData,
              followers,
              following,
            },
          },
        });
      },
    });
  } catch (err) {
    throw err;
  }
};

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

//////////////////
const addAllPolesToCache = async (
  addChatMssgFunc: (
    options?: MutationFunctionOptions<any, OperationVariables> | undefined
  ) => Promise<FetchResult<any, Record<string, any>, Record<string, any>>>,
  details: string,
  pollId: string
) => {
  try {
    addChatMssgFunc({
      variables: { details },
      update(cache, { data: { createMessage } }) {
        const poll: any = cache.readQuery({
          query: GET_POLL,
          variables: { pollId },
        });

        // cache.writeQuery({
        //   query: GET_ACTIVE_CHATS,
        //   data: {
        //     activeChats: activeChatsUpdated,
        //   },
        // });
      },
    });
  } catch (err) {
    throw err;
  }
};
