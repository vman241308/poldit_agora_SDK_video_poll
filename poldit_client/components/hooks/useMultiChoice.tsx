import { ApolloError, useMutation } from "@apollo/client";
import { useToast } from "@chakra-ui/react";
import { Answer } from "_components/appTypes/appType";
import { useAuth } from "_components/authProvider/authProvider";
import { getToasts } from "_components/pageComponents/Other/Toast/toastTypes";
import GraphResolvers from "../../lib/apollo/apiGraphStrings";

type TUseMultiChoice = (
  pollType: string,
  isVideo: Boolean
) => IMultiChoiceResult;

type TMultiChoiceHandler = (id: string, answerId: string) => void;

export interface IMultiChoiceResult {
  myVote: (answers: Answer[]) => string | undefined;
  multiLoading: boolean;
  multiError: ApolloError | undefined;
  multiChoiceHandler: TMultiChoiceHandler;
}

const useMultiChoice: TUseMultiChoice = (pollType, isVideo) => {
  const auth = useAuth();
  const toast = useToast();

  const [handleMultiChoice, { loading: multiLoading, error: multiError }] =
    useMutation(GraphResolvers.mutations.MULTI_CHOICE_HANDLER);

  const myVote = (answers: Answer[]) => {
    const userId = auth?.authState?.getUserData?._id;
    let yourVote: string | undefined;
    if (
      pollType === "multiChoice" &&
      userId &&
      answers.length > 0 &&
      answers[0].multichoiceVotes
    ) {
      yourVote = answers[0].multichoiceVotes.find(
        (a: any) => userId === a.userId
      )?.vote;
    }
    return yourVote ?? "";
  };

  const multiChoiceHandler: TMultiChoiceHandler = async (id, answerId) => {
    const userId = auth?.authState?.getUserData?._id;
    const details = JSON.stringify({ id, answerId, userId, isVideo });
    try {
      await handleMultiChoice({ variables: { details } });
      getToasts(toast, "success", {
        id: "",
        duration: 3000,
        iconSize: "20px",
        msg: "Answer submitted successfully",
        position: "bottom",
        noId: true,
      });
    } catch (err: any) {
      if (err.message === "UnAuthorized Access !") {
        getToasts(toast, "error", {
          id: "unauthorizedAccess",
          duration: 3000,
          iconSize: "20px",
          msg: "Please log in or register to select answers!",
          position: "bottom",
        });
        return;
      }
      getToasts(toast, "error", {
        id: "cannotSubmitAns",
        duration: 3000,
        iconSize: "20px",
        msg: "Failed! Cannot submit answer",
        position: "bottom",
      });
    }
  };

  return { myVote, multiLoading, multiError, multiChoiceHandler };
};

export default useMultiChoice;
