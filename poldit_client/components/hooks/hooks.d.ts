import { ApolloError } from "@apollo/client";
import { PollHistory_Video } from "_components/appTypes/appType";
import { IUserPresence } from "_components/pageComponents/Poll/Video/video";
import { PollHistory } from "..";

interface IChildPollFeed {
  cursor: string;
  polls: PollHistory_Video[];
  hasMoreData: boolean;
  totalPolls: number;
}

interface PollHistory_Video extends PollHistory {
  isBroadcasted: boolean;
}

type TUseTopAnswers = (
  pollId: string,
  numAnswers?: number
) => IUseTopAnswersResults;

interface IUseTopAnswersResults {
  data: any;
  loading: boolean;
  error: ApolloError | undefined;
}

type TUseUpdatePoll = (
  pollId: string,
  userId: string,
  limit: number
) => IUseUpdatePollResults;
type TUpdatePoll = (pollId: string, key: string, val: boolean) => void;

type THandleEditPoll = (question: EditQ) => void;

type TFetchMore = any;

interface IUseUpdatePollResults {
  handleEditPoll: THandleEditPoll;
  pollsActions: IPollsActions;
}

interface IPollsActions {
  getPolls: LazyQueryExecFunction<any, OperationVariables>;
  updatePolls: TUpdatePoll;
  loading: boolean;
  error: ApolloError | undefined;
  data: IChildPollFeed;
  fetchMore: TFetchMore;
  // data: PollHistory_Video[];
  // data: { childPollsForParentPoll: PollHistory[] };
}
