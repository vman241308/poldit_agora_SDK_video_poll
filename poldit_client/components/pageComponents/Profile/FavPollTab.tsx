import { Box, Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import { useQuery } from "@apollo/client";
import InfiniteScroller from "../Other/InfiniteScroll";
import DataWindow from "../Home/DataWindow";
import * as _ from "lodash";

export const FavPollTab = () => {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(5);
  const [hasMore, setHasMore] = useState(true);
  const [polls, setPolls] = useState<any[]>([]);

  const {
    data: favPolls,
    loading: favPollsLoading,
    fetchMore: getMoreFavPolls,
    // updateQuery: favPollsUpdate,
  } = useQuery(GraphResolvers.queries.GET_FAVORITE_POLLS, {
    variables: { offset: 0, limit: limit },
  });

  useEffect(() => {}, [favPolls?.getFavoritePolls]);

  const fetchAndUpdateData = async () => {
    let current;
    if (offset === 0) {
      current = 5;
    } else {
      current = 0;
    }
    const { data } = await getMoreFavPolls({
      variables: {
        offset: current === 5 ? current : offset,
        limit: limit,
      },
    });
    if (
      favPolls?.getFavoritePolls[0]?.totalPolls <= polls.length ||
      data.getFavoritePolls.length === 0
    ) {
      setHasMore(false);
      return polls;
    } else {
      if (favPolls?.getFavoritePolls) {
        if (current === 5) {
          let poll = [...favPolls?.getFavoritePolls, ...data.getFavoritePolls];
          let unique = _.uniqBy(poll, function (e: any) {
            return e._id;
          });
          setPolls(unique);
        } else {
          let poll = [...polls, ...data.getFavoritePolls];
          let unique = _.uniqBy(poll, function (e: any) {
            return e._id;
          });
          setPolls(unique);
        }
      }
      return data;
    }
  };

  // pollsByUser from the backend Query will be used here!
  useEffect(() => {
    if (favPolls?.getFavoritePolls) {
      setOffset(polls.length);
      if (
        favPolls?.getFavoritePolls[0]?.totalPolls === polls?.length ||
        favPolls?.getFavoritePolls.length === 0
      ) {
        setHasMore(false);
      }
    }
  }, [favPolls?.getFavoritePolls, polls]);

  return favPollsLoading ? (
    <Flex key={"favpollsLoading"} justify="center" align="center" minH="300px">
      <Spinner size="lg" color="poldit.100" />
    </Flex>
  ) : (
    <InfiniteScroller
      loadMore={fetchAndUpdateData}
      hasMoreItems={hasMore}
      loaderKey="homeLoader"
      dataLength={polls.length}
    >
      <Box mt="8">
        {polls.length === 0 ? (
          favPolls?.getFavoritePolls.length > 0 ? (
            <DataWindow data={favPolls?.getFavoritePolls} />
          ) : (
            <h1 key={"noFavPollsFound"}>
              Your Favorite Polls Will Show Up Here !
            </h1>
          )
        ) : (
          <DataWindow data={polls} />
        )}
      </Box>
    </InfiniteScroller>
  );
};
