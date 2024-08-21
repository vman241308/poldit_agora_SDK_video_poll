import React, { useEffect, useState } from "react";
import { PollHistory_Video, TUpdatePoll, TUseUpdatePoll } from "./hooks";
import GraphResolvers from "_apiGraphStrings/index";
import { useToast } from "@chakra-ui/react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { EditQ } from "_components/pageComponents/Poll/Question";
import { updatePoll } from "lib/apollo/apolloFunctions/mutations";
import { getToasts } from "_components/pageComponents/Other/Toast/toastTypes";
import { Answer, PollHistory } from "_components/appTypes/appType";

const usePollActions: TUseUpdatePoll = (pollId, userId, limit) => {
  const errList = [
    "This question already exists",
    "Content contains inappropriate language.  Please update and resubmit.",
  ];

  const toast = useToast();
  const [polls, setPolls] = useState<PollHistory_Video[]>([]);
  const [editPoll] = useMutation(GraphResolvers.mutations.UPDATE_POLL);

  // const { loading, error, data, subscribeToMore, fetchMore } = useQuery(
  //   GraphResolvers.queries.CHILD_POLLS_FOR_PARENT,
  //   {
  //     variables: { cursor: "", pollId, limit },
  //     notifyOnNetworkStatusChange: true,
  //   }
  // );

  const [getPolls, { loading, data, subscribeToMore, error, fetchMore }] =
    useLazyQuery(GraphResolvers.queries.CHILD_POLLS_FOR_PARENT, {
      fetchPolicy: "network-only",
    });

  const updatePolls: TUpdatePoll = (pollId, key, val) => {
    setPolls((prev) =>
      prev.map((x) =>
        x._id === pollId ? { ...x, [key]: val } : { ...x, [key]: false }
      )
    );
    // setPolls(
    //   polls.map((x) =>
    //     x._id === pollId ? { ...x, [key]: val } : { ...x, [key]: false }
    //   )
    // );
  };

  const handleEditPoll = async (questionObj: EditQ) => {
    try {
      await updatePoll(editPoll, JSON.stringify(questionObj));
      getToasts(toast, "success", {
        id: "pollUpdated",
        duration: 2000,
        iconSize: "20px",
        msg: "Poll Updated!",
        position: "bottom",
      });
      //   props.update(questionObj.question);

      // onClose();
    } catch (err: any) {
      const errMssg = err.message as string;

      const displayMssg = errList.includes(errMssg)
        ? errMssg
        : "Oops!  Something went wrong.  Please refresh the page and try again.";

      getToasts(toast, "error", {
        id: "editQuestionError",
        duration: 2000,
        iconSize: "20px",
        msg: displayMssg,
        position: "bottom",
      });
    }
  };

  useEffect(() => {
    subscribeToMore({
      document: GraphResolvers.subscriptions.QUESTION_SUBSCRIPTION,
      variables: { parentId: pollId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        let newItem = {
          ...subscriptionData.data.newQuestion,
          isBroadcasted: false,
        };

        if (newItem.parentPollId._id === pollId) {
          return Object.assign({}, prev, {
            childPollsForParentPoll: {
              ...prev.childPollsForParentPoll,
              polls: [newItem, ...prev.childPollsForParentPoll.polls],
            },
          });
        }
        return prev;
      },
    });
  }, []);

  return {
    handleEditPoll,
    pollsActions: {
      getPolls,
      updatePolls,
      data: data?.childPollsForParentPoll,
      loading,
      error,
      fetchMore,
    },
    // pollsActions: { getPolls, loading, data },
  };
};

export default usePollActions;
