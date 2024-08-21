import { ISubTopic, ITopic } from "../../appTypes/appType";

interface ITopicProps {
  topics: ITopic[];
  loading: boolean;
  error: ApolloError | undefined;
  selected: ITopic | null | undefined;
  update: TUpdate;
  // search: TSearch;
}

interface ISubTopicsPerTopic {
  topic: ITopic;
  subtopics: ISubTopic[];
}

interface IPollProps {
  loading: boolean;
  hasMore: boolean;
  polls: PollHistory[];
  loadMore: () => Promise<PollHistory[] | undefined>;
}

interface ISubtopicProps {
  subtopics: ISubTopicsPerTopic | null | undefined;
  loading: boolean;
  error: ApolloError | undefined;
  selectedTopic: ITopic | null | undefined;
  selected: ISubTopic | null | undefined;
  update: TUpdate;
  // search: TSearch;
}

type TSearch = (e: React.ChangeEvent<HTMLInputElement>) => void;

type TUpdate = (
  btnId: string,
  btnType: "topic" | "subtopic",
  showPolls?: boolean
) => void;

interface ITag {
  id: string;
  tagType: "topic" | "subTopic";
  topic?: string;
}
