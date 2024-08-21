import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import TimeAgo from "react-timeago";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import InfiniteScroll from "react-infinite-scroller";
import _ from "lodash";
import { Activity } from "_components/appTypes/appType";
import { richTxt_toTxt } from "../Other/RichText/richTxtFuncs";

export const ActivityTab = ({ appId }: { appId: string }) => {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [activities, setactivities] = useState<any[]>([]);
  const [first, setFirst] = useState<Boolean>(true);
  const [totalPolls, setTotalPolls] = useState<Number>(0);
  const [hasMore, setHasMore] = useState(true);

  const {
    data: activityData,
    loading: activityDataLoading,
    fetchMore: getMore,
  } = useQuery(
    GraphResolvers.queries.GET_ALL_ACTIVITY_OF_USER_WITH_PAGINATION,
    {
      fetchPolicy: "network-only",
      variables: { appId, offset: offset, limit: limit },
    }
  );

  useEffect(() => {
    //setActivies as soon as data is received
    if (activityData?.getAllActivityOfUserWithPagination && first) {
      setactivities(
        activityData?.getAllActivityOfUserWithPagination.userActivity
      );
      setOffset(
        activityData?.getAllActivityOfUserWithPagination.userActivity.length
      );
      setTotalPolls(
        activityData?.getAllActivityOfUserWithPagination.totalPolls
      );
      setFirst(false);
    }
  }, [activityData?.getAllActivityOfUserWithPagination, first]);
  const fetchAndUpdateData = async () => {
    let current;
    if (offset === 0) {
      current = 10;
    } else {
      current = 0;
    }
    const { data } = await getMore({
      variables: {
        offset: current === 10 ? current : offset,
        limit: limit + limit,
      },
    });
    if (
      data?.getAllActivityOfUserWithPagination?.userActivity.length === 0 ||
      totalPolls <= activities.length
    ) {
      setHasMore(false);
    } else {
      if (activities.length > 0) {
        let poll = [
          ...activities,
          ...data.getAllActivityOfUserWithPagination.userActivity,
        ];
        let unique = _.uniqBy(poll, function (e: any) {
          return e.activityId;
        });
        setactivities(unique);
        setOffset(
          activities.length +
            data.getAllActivityOfUserWithPagination.userActivity.length
        );
      }
    }
  };
  useEffect(() => {
    if (activityData?.getAllActivityOfUserWithPagination && !first) {
      if (
        totalPolls <= activities?.length ||
        activityData?.getAllActivityOfUserWithPagination.userActivity.length ===
          0
      ) {
        setHasMore(false);
      }
    }
  }, [activityData?.getAllActivityOfUserWithPagination, activities, first]);
  return first ? (
    <Flex justify="center" align="center" minH="300px">
      <Spinner size="lg" color="poldit.100" />
    </Flex>
  ) : (
    <InfiniteScroll
      pageStart={0}
      style={{ overflow: "hidden" }}
      loadMore={() => {
        fetchAndUpdateData();
      }}
      hasMore={hasMore}
      loader={
        <Flex justify="center" align="center" key={"homeLoader"}>
          <Spinner size="lg" color="poldit.100" />
        </Flex>
      }
    >
      <Box mt="8">
        {activities.map((x: any, index: number) => (
          <ActivityCard key={index} activity={x} />
        ))}
      </Box>
    </InfiniteScroll>
  );
};

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  return (
    <Box mb="6">
      <Box borderBottom="1px solid #d3d3d3" pb="1">
        <Box>
          <ActivityMssg activity={activity} />
        </Box>
        <Box>
          <Text fontSize="sm" color="gray.600">
            <TimeAgo date={activity.date} live={false} />
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

const ActivityMssg = ({ activity }: ActivityCardProps) => {
  const answer = activity.answer && richTxt_toTxt(activity.answer as string);
  const question =
    activity.poll_question && richTxt_toTxt(activity.poll_question as string);

  switch (true) {
    case activity.type.search("Chat") > -1:
      return (
        <Link href={`/Polls/${activity.pollId}`}>
          <Text
            color="gray.800"
            cursor="pointer"
            _hover={{ color: "blue.500" }}
          >
            You added chat messages on {activity.creator}'s poll{" "}
            <b style={{ fontWeight: 500 }}>{question}</b>
          </Text>
        </Link>
      );

    case activity.type.search("Multiple Choice") > -1:
      return (
        <Link href={`/Polls/${activity.pollId}`}>
          <Text
            color="gray.800"
            cursor="pointer"
            _hover={{ color: "blue.500" }}
          >
            You selected the answer <b style={{ fontWeight: 500 }}>{answer}</b>{" "}
            on {activity.creator}'s poll{" "}
            {activity.poll_question && (
              <b style={{ fontWeight: 500 }}>{question}</b>
            )}
          </Text>
        </Link>
      );

    case activity.type === "Create Answer":
      return (
        <Link href={`/Polls/${activity.pollId}`}>
          <Text
            color="gray.800"
            cursor="pointer"
            _hover={{ color: "blue.500" }}
          >
            You created an answer <b style={{ fontWeight: 500 }}>{answer}</b> on{" "}
            {activity.creator}'s poll{" "}
            {activity.poll_question && (
              <b style={{ fontWeight: 500 }}>{question}</b>
            )}
          </Text>
        </Link>
      );
    case activity.type === "Like Answer":
      return (
        <Link href={`/Polls/${activity.pollId}`}>
          <Text
            color="gray.800"
            cursor="pointer"
            _hover={{ color: "blue.500" }}
          >
            You liked {activity.creator}'s answer'
            <b style={{ fontWeight: 500 }}>{answer}</b> on poll{" "}
            {activity.poll_question && (
              <b style={{ fontWeight: 500 }}>{question}</b>
            )}
          </Text>
        </Link>
      );
    case activity.type === "Dislike Answer":
      return (
        <Link href={`/Polls/${activity.pollId}`}>
          <Text
            color="gray.800"
            cursor="pointer"
            _hover={{ color: "blue.500" }}
          >
            You disliked {activity.creator}'s answer'
            <b style={{ fontWeight: 500 }}>{answer}</b> on poll{" "}
            {activity.poll_question && (
              <b style={{ fontWeight: 500 }}>{question}</b>
            )}
          </Text>
        </Link>
      );
    case activity.type === "Create Topic":
      return (
        <Text color="gray.800">
          You added a new topic{" "}
          <b style={{ fontWeight: 500 }}>{activity.topic}</b>
        </Text>
      );

    case activity.type === "Create SubTopic":
      return (
        <Text color="gray.800">
          You added a new subtopic <b>{activity.subTopic}</b> for topic{" "}
          <b>{activity.topic}</b>
        </Text>
      );
  }

  return <Text color="gray.800">Activity Data Not Available</Text>;
};
