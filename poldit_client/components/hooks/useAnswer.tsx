import {
  ApolloError,
  DocumentNode,
  useMutation,
  useQuery,
} from "@apollo/client";
import { useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import { Answer } from "_components/appTypes/appType";
import { getAuthId } from "_components/authProvider";
import { useAuth } from "_components/authProvider/authProvider";
import { getSortedListByDate } from "_components/globalFuncs";
import { getToasts } from "_components/pageComponents/Other/Toast/toastTypes";
import GraphResolvers from "../../lib/apollo/apiGraphStrings";
import { TUseTopAnswers } from "./hooks";

const useTopAnswers: TUseTopAnswers = (pollId, numAnswers) => {
  const sessionUserId = getAuthId();

  const { data, loading, error, subscribeToMore } = useQuery(
    GraphResolvers.queries.GET_TOP_ANSWERS_BY_POLL,
    {
      variables: { pollId, numAnswers },
    }
  );

  useEffect(() => {
    subscribeToMore({
      document: GraphResolvers.subscriptions.ANSWER_SUBSCRIPTION,
      variables: { pollId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        let newAnswerItem = {
          ...subscriptionData.data.newAnswer,
        };

        if (sessionUserId === newAnswerItem.creator._id) {
          newAnswerItem = {
            ...newAnswerItem,
            isEditable: true,
            isRemoveable: true,
          };
        }
        const answerMatchIdx: number = prev?.topAnswersByPoll.findIndex(
          (item: Answer) => item._id === newAnswerItem._id
        );

        if (answerMatchIdx > -1) {
          let updatedAnswersByPoll: Answer[] = [];

          if (newAnswerItem.isRemoved) {
            //Answer is being removed
            updatedAnswersByPoll = prev.topAnswersByPoll.filter(
              (item: Answer) => item._id !== newAnswerItem._id
            );
          } else {
            //Answer already exists.  This is for likes and dislikes count update without adding new answer
            updatedAnswersByPoll = prev.topAnswersByPoll.map(
              (item: Answer, idx: number) => {
                if (idx === answerMatchIdx) {
                  return newAnswerItem;
                } else return item;
              }
            );
          }

          if (newAnswerItem.poll._id === pollId) {
            return Object.assign({}, prev, {
              topAnswersByPoll: updatedAnswersByPoll,
            });
          }

          return prev;
        }

        if (newAnswerItem.poll._id === pollId) {
          let topAnswers: any = [
            ...prev.topAnswersByPoll,
            newAnswerItem,
          ].filter((answer: Answer) => {
            if (answer.rank !== "Not Ranked") {
              const numRank = Number(
                (answer.rank as string).replace(/^\D+/g, "")
              );
              return numRank === 1 && answer;
            }
            if (
              answer.rank === "Not Ranked" &&
              answer.creator?._id === "63a1e2342e34a062fc2e42cf"
            ) {
              return answer;
            }
          });

          topAnswers = getSortedListByDate(topAnswers);

          return Object.assign({}, prev, {
            topAnswersByPoll: [...topAnswers.slice(0, numAnswers)],
          });
        }
        return prev;
      },
    });
  }, []);

  return { data, loading, error };
};

export default useTopAnswers;
