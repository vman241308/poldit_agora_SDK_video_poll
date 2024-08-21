import {
  Flex,
  Stack,
  Grid,
  GridItem,
  Box,
  Spinner,
  Text,
  Tag,
  Heading,
  Button,
} from "@chakra-ui/react";
import Link from "next/link";
import { HomeBtn } from "pages";
import AppMssg from "../Other/AppMssgs";
import InfiniteScroller from "../Other/InfiniteScroll";
import DataWindow from "./DataWindow";
import PolditInfo, { PolditInfo_Mobile } from "./PolditInfo";
import PollWindow from "./pollBtns";
import Sidebar from "./Sidebar";

export type Update = (btn: string) => void;

export type HandleTopic = (topic: string) => void;

interface HomePageView {
  update: Update;
  hasMore: boolean;
  loadMore: any;
  btns: HomeBtn[];
  btnLoading: boolean;
  loggedIn: boolean;
  isMobile: boolean;
  handleTopic: HandleTopic;
  topic: string;
}

const HomePageView = (props: HomePageView) => {
  if (props.isMobile) {
    return <MobileView {...props} />;
  }

  return <DeskTopView {...props} />;
};

export default HomePageView;

export const DeskTopView = ({
  update,
  hasMore,
  loadMore,
  btns,
  btnLoading,
  loggedIn,
  handleTopic,
  topic,
}: HomePageView) => {
  const activeBtn = btns.find((x) => x.active) as HomeBtn;

  return (
    <Grid
      templateRows="repeat(1, 1fr)"
      templateColumns="repeat(5, 1fr)"
      gap="10"
      p="5"
    >
      <GridItem colSpan={1}>
        <PolditInfo loggedIn={loggedIn} />
      </GridItem>
      <GridItem colSpan={2} overflow={"auto"}>
        {activeBtn.data.length > 0 ? (
          <>
            <Box>
              <InfiniteScroller
                loadMore={loadMore}
                hasMoreItems={hasMore}
                dataLength={activeBtn.data.length}
                totalPolls={activeBtn.data[0].totalPolls}
                loaderKey="homeLoader"
              >
                <DataWindow data={activeBtn.data} btn={activeBtn.btnName} />
              </InfiniteScroller>
            </Box>
          </>
        ) : (
          <Flex h="calc(100vh - 60px)" justify="center" align="center">
            <Spinner size="lg" color="poldit.100" />
          </Flex>
        )}
      </GridItem>
      <GridItem colSpan={1}>
        <Stack spacing="10">
          <Sidebar btns={btns} update={update} loading={btnLoading} />
          <PollWindow
            data={activeBtn.data}
            topic={topic}
            handleTopic={handleTopic}
            loading={btnLoading}
          />
        </Stack>
      </GridItem>
    </Grid>
  );
};

export const MobileView = ({
  update,
  hasMore,
  loadMore,
  btns,
  btnLoading,
  loggedIn,
  topic,
  handleTopic,
}: HomePageView) => {
  const activeBtn = btns.find((x) => x.active) as HomeBtn;

  return (
    <Stack spacing="5">
      <PolditInfo_Mobile loggedIn={loggedIn} />
      <Box pl="1" pr="1">
        <Sidebar
          btns={btns}
          update={update}
          loading={btnLoading}
          isMobile={true}
        />
      </Box>
      <Box pl="1" pr="1">
        <PollWindow
          data={activeBtn.data}
          isMobile={true}
          topic={topic}
          handleTopic={handleTopic}
          loading={btnLoading}
        />
      </Box>

      {activeBtn.data.length > 0 ? (
        <>
          <Box>
            <InfiniteScroller
              loadMore={loadMore}
              hasMoreItems={hasMore}
              dataLength={activeBtn.data.length}
              loaderKey="homeLoader"
            >
              <DataWindow
                data={activeBtn.data}
                btn={activeBtn.btnName}
                isMobile={true}
              />
            </InfiniteScroller>
          </Box>
        </>
      ) : (
        <Flex h="calc(100vh - 60px)" justify="center" align="center">
          <Spinner size="lg" color="poldit.100" />
        </Flex>
      )}
    </Stack>
  );
};
