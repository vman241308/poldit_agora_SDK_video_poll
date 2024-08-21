import {
  Box,
  Container,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";

import { useRouter } from "next/router";
import Layout from "_components/layout/Layout";
import { ISubTopic, ITopic, PollHistory } from "_components/appTypes/appType";
import { useQuery, useLazyQuery } from "@apollo/client";
import GraphResolvers from "../../lib/apollo/apiGraphStrings";
import SubTopicBox from "_components/pageComponents/Topics/subTopics";
import TopicBox from "_components/pageComponents/Topics/topics";
import { handleStorage } from "_components/formFuncs/formFuncs";
import SimpleBar from "simplebar-react";
import InfiniteScroller from "_components/pageComponents/Other/InfiniteScroll";
import DataWindow from "_components/pageComponents/Home/DataWindow";
import { getObjList_NoDuplicates } from "_components/globalFuncs";
import { filterSearchVals } from "_components/formFuncs/miscFuncs";
import { AiOutlinePlusCircle } from "react-icons/ai";
import {
  AddSubTopicWindow,
  AddTopicWindow,
} from "_components/pageComponents/Other/Topics/pollTags";
import { InfoBtn } from "_components/pageComponents/Other/Button/miscButtons";
import { useAuth } from "_components/authProvider/authProvider";
import * as _ from "lodash";
import Metadata from "_components/pageComponents/Other/Metadata";
import { GetServerSideProps } from "next";

const TopicPage = ({}: any) => {
  const router = useRouter();
  const auth = useAuth();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpen_st,
    onOpen: onOpen_st,
    onClose: onClose_st,
  } = useDisclosure();

  const itemLimit = 5;

  const storedData =
    typeof window !== "undefined" &&
    (localStorage.getItem("PoldIt-data") as string);

  //-----------------------------------------------------------------------------------------
  // State

  const [selectedTopic, setSelectedTopic] = useState<ITopic | null>();
  const [selectedSubTopic, setSelectedSubTopic] = useState<ISubTopic | null>();
  const [allTopics, setAllTopics] = useState<ITopic[]>([]);
  const [subTopicsByTopic, setSubTopicsByTopic] = useState<ISubTopic[]>([]);
  const [polls, setPolls] = useState<PollHistory[]>([]);
  const [tag, setTag] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [currOffset, setCurrOffset] = useState(0);

  //-----------------------------------------------------------------------------------------
  // API

  const { data: topics, loading: topicsLoading } = useQuery(
    GraphResolvers.queries.GET_TOPICS,
    {
      onCompleted: (res) => setAllTopics(res.topics),
    }
  );

  const { data: subTopics, loading: subTopicsLoading } = useQuery(
    GraphResolvers.queries.GET_SUBTOPICS
  );

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

  //-----------------------------------------------------------------------------------------
  // Functions

  const resetStates: any = () => {
    setCurrOffset(0);
    setPolls([]);
  };

  const updateSelector = (btnType: string, btnId: string) => {
    resetStates();

    if (btnType === "topic" && topics) {
      const topic: ITopic = topics.topics.find(
        (item: ITopic) => item._id === btnId
      );

      const AllTopic: ITopic = {
        _id: "All_1",
        description: "",
        topic: "All Topics",
      };

      const pickedTopic = topic ? topic : AllTopic;

      setSelectedTopic(pickedTopic);
      subCategoriesSelector(pickedTopic._id);
      setSelectedSubTopic(null);
    }

    if (btnType === "subTopic" && subTopics) {
      const subTopic: ISubTopic = subTopics.subTopics.find(
        (item: ISubTopic) => item._id === btnId
      );
      if (subTopic) {
        setSelectedSubTopic(subTopic);
        setSubTopicsByTopic(subTopics.subTopics as ISubTopic[]);
      }
    }

    setTag(btnId);

    getPolls({
      variables: { tag: btnId, offset: 0, limit: itemLimit },
    });
    (document.querySelector("#searchTxt") as HTMLInputElement).value = "";
  };

  const subCategoriesSelector = (topicId: string) => {
    if (subTopics) {
      const selectedSubsByTopic: ISubTopic[] = subTopics.subTopics.filter(
        (item: ISubTopic) => item.topic._id === topicId
      );
      selectedSubsByTopic.length > 0
        ? setSubTopicsByTopic(selectedSubsByTopic)
        : setSubTopicsByTopic(subTopics.subTopics);
    }
  };

  const searchTags = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (topics && subTopics) {
      const topicResults = filterSearchVals(
        topics.topics,
        e.target.value,
        "topic"
      );
      const subTopicResults = filterSearchVals(
        subTopics.subTopics,
        e.target.value,
        "subTopic"
      );

      topicResults.length > 0 ? setAllTopics(topicResults) : setAllTopics([]);
      subTopicResults.length > 0
        ? setSubTopicsByTopic(subTopicResults)
        : setSubTopicsByTopic([]);
    }
  };

  const closeWindow = (btnType: String) => {
    btnType === "topic" && isOpen && onClose();
    btnType === "subtopic" && isOpen_st && onClose_st();
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
        // console.log({ prev, new: data.pollsByTag });
        // const uniqueList = getObjList_NoDuplicates(
        //   prev,
        //   data.pollsByTag,
        //   "_id"
        // );
        // return uniqueList;
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
      const newSearchItemToStore = { searchVal: "", tags };
      localStorage.setItem("PoldIt-data", JSON.stringify(newSearchItemToStore));
      auth?.handleSearch("");
    }
  }, []);

  useEffect(() => {
    if (router.query.id) {
      const { id, tagType } = router.query;
      updateSelector(tagType as string, id as string);
      handleStorage("PoldIt-data", "tags", router.query);
    }
  }, [subTopicsLoading]);

  useEffect(() => {
    if (storedData && !router.query.id) {
      const { tags } = JSON.parse(storedData);

      if (tags) {
        updateSelector(tags.tagType as string, tags.id as string);
      } else {
        updateSelector("topic", "All_1");
      }
    }
  }, [topicsLoading || subTopicsLoading]);

  const btnCommonStyle = {
    _active: { bg: "none" },
    _hover: { bg: "none" },
    _focus: { outline: "none" },
    size: "xs",
    // color: "gray.500",
    bg: "none",
  };

  return (
    <Layout>
      <Metadata title="All Topics" />
      <Container maxW="container.xl">
        <Flex wrap="wrap" pt="6">
          <Flex
            flex={{ base: "0 0 100%", lg: "0 0 30%" }}
            maxW={{ base: "100%", lg: "30%" }}
            mt={{ base: 3, lg: 0 }}
            justify="center"
          >
            <Box
              position={{ base: "relative", lg: "sticky" }}
              pl="2"
              pr={{ base: 2, lg: 6 }}
              h={{ base: "100%", lg: "calc(100vh - 200px)" }}
              top={{ base: "0", lg: "6.6rem" }}
              mb={{ base: 8, lg: 0 }}
              w="100%"
            >
              <SimpleBar
                autoHide={false}
                style={{
                  height: "100%",
                  overflowX: "hidden",
                  outline: "none !important",
                }}
              >
                <Box mb="5">
                  <InputGroup>
                    <InputLeftElement
                      pointerEvents="none"
                      children={<BiSearch size="20" />}
                      h="100%"
                    />
                    <Input
                      size="md"
                      id="searchTxt"
                      placeholder="Search topics and subtopics"
                      borderColor="gray.300"
                      borderRadius="md"
                      maxW="95%"
                      onChange={searchTags}
                    />
                  </InputGroup>
                </Box>
                <Box pb="6" pr="3">
                  <Box>
                    <Flex justify={"space-between"}>
                      <HStack>
                        <Text color="gray.700" fontWeight="bold" fontSize="lg">
                          Poll Topics
                        </Text>
                        <Box pt="0.2">
                          <InfoBtn
                            msgTxt="Select a topic to see all polls associated with it. The number shown on each button represents the number of polls for that topic."
                            size="16px"
                            placement="left"
                          />
                        </Box>
                      </HStack>

                      <Flex justify="center" align="center" mr="4">
                        {/* <Tooltip
                          label="Add a new topic"
                          hasArrow
                          placement="right-end"
                          fontSize={"sm"}
                        >
                          <IconButton
                            aria-label="heart"
                            onClick={onOpen}
                            mt="1"
                            icon={
                              <AiOutlinePlusCircle
                                size="18px"
                                color="#12d845"
                              />
                            }
                            {...btnCommonStyle}
                          />
                        </Tooltip> */}
                        <Modal isOpen={isOpen} onClose={onClose}>
                          <ModalOverlay />
                          <AddTopicWindow
                            close={closeWindow}
                            topics={allTopics}
                            setTopics={setAllTopics}
                          />
                        </Modal>
                      </Flex>
                    </Flex>
                    <TopicBox
                      loading={topicsLoading}
                      data={allTopics}
                      selected={selectedTopic}
                      update={updateSelector}
                      showAll={true}
                    />
                  </Box>
                </Box>
                <Box borderBottom="1px solid #d3d3d3" maxW="95%"></Box>
                <Box mt="6" pr="3">
                  <Flex justify={"space-between"}>
                    <HStack>
                      <Text color="gray.700" fontWeight="bold" fontSize="lg">
                        Poll SubTopics
                      </Text>
                      <InfoBtn
                        msgTxt="Select a subtopic to see all polls associated with it. The number shown on each button represents the number of polls for that subtopic."
                        size="16px"
                        placement="left"
                      />
                    </HStack>
                    <Flex justify="center" align="center" mr="4">
                      <Tooltip
                        label="Add a new subtopic"
                        hasArrow
                        placement="right-end"
                        fontSize={"sm"}
                      >
                        <IconButton
                          aria-label="heart"
                          onClick={onOpen_st}
                          mt="1"
                          icon={
                            <AiOutlinePlusCircle size="18px" color="#12d845" />
                          }
                          {...btnCommonStyle}
                        />
                      </Tooltip>
                      <Modal isOpen={isOpen_st} onClose={onClose_st}>
                        <ModalOverlay />
                        {/* <AddSubTopicWindow
                          close={closeWindow}
                          loading={topicsLoading}
                          data={topics?.topics}
                          setSubTopics={setSubTopicsByTopic}
                          subTopics={subTopicsByTopic}
                        /> */}
                      </Modal>
                    </Flex>
                  </Flex>
                  <SubTopicBox
                    loading={subTopicsLoading}
                    data={subTopicsByTopic}
                    selected={selectedSubTopic}
                    update={updateSelector}
                  />
                </Box>
              </SimpleBar>
            </Box>
          </Flex>
          <Flex
            flex={{ base: "0 0 100%", lg: "0 0 70%" }}
            maxW={{ base: "100%", lg: "70%" }}
            w="100%"
            mt="6"
          >
            {pollLoading ? (
              <Flex justify="center" align="center" w="100%">
                <Spinner size="lg" color="poldit.100" />
              </Flex>
            ) : (
              <Box w="100%">
                <InfiniteScroller
                  dataLength={polls.length}
                  loadMore={fetchAndUpdate}
                  hasMoreItems={hasMore}
                  loaderKey="topicLoader"
                >
                  <DataWindow data={polls} />
                </InfiniteScroller>
              </Box>
            )}
          </Flex>
        </Flex>
      </Container>
    </Layout>
  );
};

export default TopicPage;

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const restrictedPages = ["/index_old", "/topics/index_old"];
//   const { req } = context;
//   const currentUrl = req.url;

//   if (currentUrl && restrictedPages.includes(currentUrl)) {
//     return {
//       redirect: {
//         destination: "/",
//         permanent: false,
//       },
//     };
//   }
//   return { props: {} };
// };