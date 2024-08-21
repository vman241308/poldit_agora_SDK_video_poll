import React, { useEffect, useState } from "react";
import { Box, Grid, GridItem, Stack } from "@chakra-ui/react";
import GraphResolvers from "../../lib/apollo/apiGraphStrings";
import Layout from "_components/layout/Layout";
import Metadata from "_components/pageComponents/Other/Metadata";
import { useAuth } from "_components/authProvider/authProvider";
import TopicCtr from "_components/pageComponents/Topics/topicCtr";
import { useQuery, useLazyQuery } from "@apollo/client";
import { ISubTopic, ITopic, PollHistory } from "_components/appTypes/appType";
import SubtopicCtr from "_components/pageComponents/Topics/subTopCtr";
import {
  ISubTopicsPerTopic,
  ITag,
  TUpdate,
} from "_components/pageComponents/Topics/topic_types";
import PollCtr from "_components/pageComponents/Topics/pollCtr";
import { useRouter } from "next/router";

interface IProps {}

const TopicPage = (props: IProps) => {
  const auth = useAuth();
  const router = useRouter();
  const itemLimit = 5;

  const storedData =
    typeof window !== "undefined" &&
    (localStorage.getItem("PoldIt-data") as string);

  const [currOffset, setCurrOffset] = useState(0);
  const [tag, setTag] = useState("");
  const [allTopics, setAllTopics] = useState<ITopic[]>([]);
  const [subTopicsByTopic, setSubTopicsByTopic] =
    useState<ISubTopicsPerTopic | null>();
  const [selectedTopic, setSelectedTopic] = useState<ITopic | null>();
  const [selectedSubTopic, setSelectedSubTopic] = useState<ISubTopic | null>();
  const [polls, setPolls] = useState<PollHistory[]>([]);
  const [hasMore, setHasMore] = useState(false);

  //////////////////////////////////////API////////////////////////////////////////////////

  const {
    data: topics,
    loading: topicsLoading,
    error: topicsError,
  } = useQuery(GraphResolvers.queries.GET_TOPICS_WITH_COUNTS, {
    onCompleted: (res) => setAllTopics(res.topicWithCounts),
  });

  const [
    getSubtopics,
    { data: subTopics, loading: subTopicsLoading, error: subTopicsError },
  ] = useLazyQuery(GraphResolvers.queries.GET_SUBTOPICS_PER_TOPIC_WITH_COUNTS, {
    onCompleted: (res) => setSubTopicsByTopic(res.subTopicsPerTopicWithCounts),
  });

  const [getPolls, { data: pollData, loading: pollLoading, fetchMore }] =
    useLazyQuery(GraphResolvers.queries.GET_POLLS_BY_TAG, {
      // fetchPolicy: "network-only",
      onCompleted: (res) => {
        setPolls(res.pollsByTag);
        res.pollsByTag.length < itemLimit
          ? setHasMore(false)
          : setHasMore(true);
      },
    });

  ///////////////// Functions /////////////////////////////////////////////////////////////////

  const searchTags = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    // if (topics && subTopics) {
    //   const topicResults = filterSearchVals(
    //     topics.topics,
    //     e.target.value,
    //     "topic"
    //   );
    //   const subTopicResults = filterSearchVals(
    //     subTopics.subTopics,
    //     e.target.value,
    //     "subTopic"
    //   );

    //   topicResults.length > 0 ? setAllTopics(topicResults) : setAllTopics([]);
    //   subTopicResults.length > 0
    //     ? setSubTopicsByTopic(subTopicResults)
    //     : setSubTopicsByTopic([]);
    // }
  };

  const getContentByTag = (tags: ITag) => {
    if (tags && tags.tagType === "topic") {
      updateSelector(tags.id, "topic", true);
    }

    if (tags && tags.topic && tags.tagType === "subTopic") {
      updateSelector(tags.topic, "topic");
      updateSelector(tags.id, "subtopic", true);
    }
  };

  const updateSelector: TUpdate = async (btnId, btnType, showPolls = false) => {
    if (btnType === "topic") {
      const topic = allTopics.find((x) => x._id === btnId);
      setSelectedTopic(topic);
      getSubtopics({ variables: { topic: btnId } });
    } else {
      const selected_subtopic = subTopicsByTopic?.subtopics.find(
        (x) => x._id === btnId
      );
      setSelectedSubTopic(selected_subtopic);
    }

    showPolls &&
      getPolls({
        variables: { tag: btnId, offset: 0, limit: itemLimit },
      });

    setTag(btnId);
    // router.query.id &&
    //   router.push(router.pathname, undefined, { shallow: true });
  };

  const fetchAndUpdate = async () => {
    setHasMore(false);
    const currentTag = tag;
    const newOffset = currOffset + itemLimit;

    if (polls && tag) {
      const { data } = await fetchMore({
        variables: {
          currentTag,
          offset: newOffset,
          limit: itemLimit,
        },
      });

      const nextPollsCount = data?.pollsByTag.length;
      const totalPolls = polls.length > 0 ? (polls[0].totalPolls as number) : 0;

      if (totalPolls <= polls.length || nextPollsCount === 0) {
        setHasMore(false);
        return polls;
      }

      setPolls((prev) => {
        return [...prev, ...data.pollsByTag];
      });

      setHasMore(true);
      setCurrOffset(newOffset);
    }
  };

  //-----------------------------------------------------------------------------------------
  // Component Mount Hooks

  useEffect(() => {
    if (storedData) {
      const { tags } = JSON.parse(storedData as string);

      getContentByTag(tags);
    }
  }, [storedData, allTopics, subTopicsByTopic]);

  useEffect(() => {
    if (router.query.id) {
      getContentByTag(router.query as any);
      // router.push(router.pathname, undefined, { shallow: true });
    }
  }, [allTopics, subTopicsByTopic]);

  return (
    <Layout>
      <Metadata title="All Topics" />
      {auth?.isMobile ? (
        <Stack spacing={10} p="2">
          <TopicCtr
            topics={allTopics}
            loading={topicsLoading}
            selected={selectedTopic}
            update={updateSelector}
            error={topicsError}
          />
          <Box borderBottom="1px solid #d3d3d3" maxW="98%"></Box>
          <SubtopicCtr
            loading={subTopicsLoading}
            error={subTopicsError}
            subtopics={subTopicsByTopic}
            selectedTopic={selectedTopic}
            selected={selectedSubTopic}
            update={updateSelector}
          />
          <PollCtr
            loading={pollLoading}
            hasMore={hasMore}
            polls={polls}
            loadMore={fetchAndUpdate}
          />
        </Stack>
      ) : (
        <Grid
          templateRows="repeat(1, 1fr)"
          templateColumns="repeat(5, 1fr)"
          gap="5"
          p="5"
        >
          <GridItem colSpan={2}>
            {/* <Searchbar search={searchTags} /> */}
            <Stack spacing={10} pt="3">
              <TopicCtr
                topics={allTopics}
                loading={topicsLoading}
                selected={selectedTopic}
                update={updateSelector}
                error={topicsError}
              />
              <Box borderBottom="1px solid #d3d3d3" maxW="95%"></Box>
              <SubtopicCtr
                loading={subTopicsLoading}
                error={subTopicsError}
                subtopics={subTopicsByTopic}
                selectedTopic={selectedTopic}
                selected={selectedSubTopic}
                update={updateSelector}
              />
            </Stack>
          </GridItem>
          <GridItem colSpan={3} overflow={"auto"}>
            <PollCtr
              loading={pollLoading}
              hasMore={hasMore}
              polls={polls}
              loadMore={fetchAndUpdate}
            />
          </GridItem>
        </Grid>
      )}
    </Layout>
  );
};

export default TopicPage;
