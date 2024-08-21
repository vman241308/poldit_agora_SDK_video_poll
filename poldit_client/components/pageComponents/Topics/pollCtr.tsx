import { Alert, Box, Center, Flex, Spinner } from "@chakra-ui/react";
import React from "react";
import { RiFilePaper2Line } from "react-icons/ri";
import DataWindow from "../Home/DataWindow";
import InfiniteScroller from "../Other/InfiniteScroll";
import { IPollProps } from "./topic_types";

const PollCtr = (props: IPollProps) => {
  return (
    <Box h="100%">
      {props.loading ? (
        <Center h="100%">
          <Spinner size="lg" color="poldit.100" />
        </Center>
      ) : (
        <Box w="100%" h="100%">
          {props.polls.length === 0 ? (
            <Center h="100%" color="poldit.100" fontSize={"sm"}>
              <Alert
                status="info"
                bg="none"
                w="60%"
                fontSize={"xl"}
                rounded="md"
              >
                {/* <Box mr="3">
                  <RiFilePaper2Line size="18px" color="gray" />
                </Box> */}
                Select a Topic or Subtopic to see relevant polls
              </Alert>
            </Center>
          ) : (
            <InfiniteScroller
              dataLength={props.polls.length}
              loadMore={props.loadMore}
              hasMoreItems={props.hasMore}
              loaderKey="topicLoader"
            >
              <DataWindow data={props.polls} />
            </InfiniteScroller>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PollCtr;
