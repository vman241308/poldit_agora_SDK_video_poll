import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
// import InfiniteScroll from "react-infinite-scroller";

interface InfiniteScroller {
  loadMore: any;
  children: ReactNode;
  hasMoreItems: boolean | undefined;
  dataLength: number;
  loaderKey: string;
  threshold?: number;
  totalPolls?: number;
}

const InfiniteScroller = ({
  children,
  loadMore,
  hasMoreItems,
  dataLength,
  loaderKey,
  threshold,
  totalPolls,
}: InfiniteScroller) => {
  return (
    <InfiniteScroll
      dataLength={dataLength}
      style={{ overflow: "hidden" }}
      next={loadMore}
      scrollThreshold={0.8}
      hasMore={hasMoreItems ?? false}
      loader={
        <Flex justify="center" align="center" key={loaderKey}>
          <Spinner size="lg" color="poldit.100" />
        </Flex>
      }
      endMessage={
        totalPolls &&
        dataLength === totalPolls && (
          <Box mt="5">
            <Text textAlign={"center"} color="gray.400">
              Thats all the polls!. Go out there and create some of your own.
            </Text>
          </Box>
        )
      }
    >
      {children}
    </InfiniteScroll>
  );
  // return (
  //   <InfiniteScroll
  //     threshold={threshold ?? 250}
  //     pageStart={0}
  //     style={{ overflow: "hidden" }}
  //     loadMore={loadMore}
  //     // useWindow={false}
  //     loader={
  //       <Flex justify="center" align="center" key={loaderKey}>
  //         <Spinner size="lg" color="poldit.100" />
  //       </Flex>
  //     }
  //     hasMore={hasMoreItems}
  //   >
  //     {children}
  //   </InfiniteScroll>
  // );
};

export default InfiniteScroller;
