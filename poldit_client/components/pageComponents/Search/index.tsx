import {
  Box,
  Tab,
  TabList,
  TabPanels,
  Tabs,
  Tag,
  Text,
  Spinner,
  Flex,
  TabPanel,
} from "@chakra-ui/react";
import SimpleBar from "simplebar-react";
import DataWindow from "../Home/DataWindow";
import SearchAns from "./SearchAns";
import SearchTopic from "./SearchTopic";
import SearchUser from "./SearchUser";

interface DataTabs {
  loading: boolean;
  data: any;
}

const DataTabs = ({ loading, data }: DataTabs) => (
  <Box mt="8">
    <Tabs isFitted>
      <SimpleBar
        style={{
          overflowY: "hidden",
          width: "100%",
          paddingBottom: "14px",
        }}
      >
        <TabList color="gray.400">
          {!loading && data?.question && data?.question?.count > 0 && (
            <Tab
              _focus={{ outline: "none" }}
              _selected={{
                color: "poldit.100",
                borderColor: "poldit.100",
              }}
            >
              <Text zIndex="100">Questions</Text>
              <Tag size="sm" variant="solid" colorScheme="orange" ml="2">
                {data?.question?.count}
              </Tag>
            </Tab>
          )}
          {!loading && data?.answer && data?.answer?.count > 0 && (
            <Tab
              _focus={{ outline: "none" }}
              _selected={{
                color: "poldit.100",
                borderColor: "poldit.100",
              }}
            >
              <Text zIndex="100">Answers</Text>

              <Tag size="sm" variant="solid" colorScheme="orange" ml="2">
                {data?.answer?.count}
              </Tag>
            </Tab>
          )}
          {!loading &&
            (data?.topic || data?.subTopic) &&
            data?.topic?.count + data?.subTopic?.count > 0 && (
              <Tab
                _focus={{ outline: "none" }}
                _selected={{
                  color: "poldit.100",
                  borderColor: "poldit.100",
                }}
              >
                <Text zIndex="100">Topics & Subtopics</Text>

                <Tag size="sm" variant="solid" colorScheme="orange" ml="2">
                  {data?.topic?.count + data?.subTopic?.count}
                </Tag>
              </Tab>
            )}

          {!loading && data?.user && data?.user?.count > 0 && (
            <Tab
              _focus={{ outline: "none" }}
              _selected={{
                color: "poldit.100",
                borderColor: "poldit.100",
              }}
            >
              <Text zIndex="100">Users</Text>

              <Tag size="sm" variant="solid" colorScheme="orange" ml="2">
                {data?.user?.count}
              </Tag>
            </Tab>
          )}
        </TabList>
      </SimpleBar>
      {loading ? <LoadingState /> : <SearchResultTabs data={data} />}
    </Tabs>
  </Box>
);

export default DataTabs;

const LoadingState = () => {
  return (
    <Flex justify="center" align="center" minH="400px" color="poldit.100">
      <Spinner size="lg" />
    </Flex>
  );
};

const SearchResultTabs = ({ data }: any) => {
  const { answer, question, subTopic, topic, user } = data;

  return (
    <TabPanels>
      {question.count > 0 && (
        <TabPanel p="0">
          <DataWindow data={question?.question} />
        </TabPanel>
      )}
      {answer.count > 0 && (
        <TabPanel p="0">
          <SearchAns results={answer?.answer} />
        </TabPanel>
      )}
      {topic.count + subTopic.count > 0 && (
        <TabPanel p="0">
          <SearchTopic topic={topic?.topic} subTopic={subTopic?.subTopic} />
        </TabPanel>
      )}
      {user.count > 0 && (
        <TabPanel p="0">
          <SearchUser data={user?.user} />
        </TabPanel>
      )}
    </TabPanels>
  );
};
