import {
  ApolloError,
  useLazyQuery,
  useMutation,
  useQuery,
} from "@apollo/client";
import {
  Box,
  Stack,
  Text,
  SimpleGrid,
  Flex,
  Spinner,
  Center,
  HStack,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  ISubTopic,
  ITopic,
  UserAreasInterest,
} from "_components/appTypes/appType";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import { BoxError } from "../Error/compError";
import TopicCtr from "./Topic";
import { SelectedTags } from "./Subtopic";
import { PoldItActionBtn } from "../Other/Button/brandedItems";
import CustomToast from "../Other/Toast";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { BiErrorCircle } from "react-icons/bi";
import { getObjList_NoDuplicates } from "_components/globalFuncs";

// export type TopicHandler = (topic: string, nextIdx: any) => void;
export type TopicHandler = (topic: string) => void;
export type UpdateSelect = () => void;

export interface SubTopic_Paginated {
  cursor: string;
  data: ISubTopic[];
  hasMoreData: boolean;
}

export interface ProfileTopic extends ITopic {
  subTopic_pages: SubTopic_Paginated;
  topicIdx?: any;
}

export interface Selected {
  topic: string;
  topicId: string;
  subtopic: string;
  subtopicId: string;
}

interface ProfileAreasInterest {
  areas: UserAreasInterest[];
}

const AreasInterest = ({ areas }: ProfileAreasInterest) => {
  const toast = useToast();
  const [allTopics, setAllTopics] = useState<ProfileTopic[]>([]);
  const [selected, setSelected] = useState<Selected[]>([]);
  const [disableSave, setDisableSave] = useState(false);

  const {
    data: topics,
    loading: topicsLoading,
    error: topicsErr,
  } = useQuery(GraphResolvers.queries.GET_TOPICS, {
    onCompleted: (res) => setAllTopics(res.topics),
  });

  const [getSubTopics, { data, loading, error, fetchMore }] = useLazyQuery(
    GraphResolvers.queries.GET_SUBTOPIC_PAGES_PER_TOPIC,
    {
      notifyOnNetworkStatusChange: true,
    }
  );

  const [addAreas, { loading: areasLoading }] = useMutation(
    GraphResolvers.mutations.ADD_AREAS_INTEREST
  );

  // const topicHandler = (topic: string, nextIdx: any) => {
  const topicHandler = (topic: string) => {
    getSubTopics({
      variables: {
        cursor: "",
        topic,
        limit: 5,
      },
      onCompleted: (res) =>
        updateSTopicRecords(topic, res.subTopicsPerTopic_paginated),
    });

    // setAllTopics(
    //   allTopics.map((x) =>
    //     x.topic === topic ? { ...x, topicIdx: [nextIdx] } : x
    //   )
    // );
  };

  const handleSubmit = async () => {
    try {
      await addAreas({ variables: { details: JSON.stringify(selected) } });
      toast({
        id: "areaAdded",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Areas of Interest Updated"}
            bg={"green.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={IoCheckmarkCircleOutline}
          />
        ),
      });
    } catch (err) {
      toast({
        id: "areaAddErr",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"Something went wrong!  Please refresh page and try again."}
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });
    }
  };

  const updateSTopicRecords = (topic: string, data: SubTopic_Paginated) => {
    setAllTopics(
      allTopics.map((x) =>
        x.topic === topic ? { ...x, subTopic_pages: data } : x
      )
    );
    selected.length > 0 && selectItemsOnLoad();
  };

  const updateSelectors = () => {
    const checked = document.querySelectorAll('input[id^="subtopic"]:checked');

    let selectors: Selected[] = [];

    if (checked.length > 0) {
      checked.forEach((x) => {
        const checked_list = x.id.split("_");

        const on_selected_already = selected.some(
          (s) => s.subtopicId === checked_list[1]
        );

        if (!on_selected_already) {
          selectors.push({
            topic: checked_list[2].split(":")[1].trim(),
            topicId: checked_list[3],
            subtopic: checked_list[0].split(":")[1].trim(),
            subtopicId: checked_list[1],
          });
        }
      });
    }

    setSelected([...selected, ...selectors]);
    setDisableSave(false);
  };

  const unselectAll = () => {
    const checked = document.querySelectorAll('input[id^="subtopic"]:checked');
    checked.forEach((x: any) => {
      if (x.type === "checkbox") {
        x.checked = false;
      }
    });
    setSelected([]);
    setDisableSave(false);
  };

  const selectItemsOnLoad = () => {
    const sTopicItems = document.querySelectorAll('input[id^="subtopic"]');

    sTopicItems.forEach((x: any) => {
      const item_id = x.id.split("_")[1].trim();
      const areaMatch = selected.some((a) => a.subtopicId === item_id);

      if (areaMatch) {
        x.checked = true;
      }
    });
  };

  const removeSelector = (selector: Selected) => {
    setDisableSave(false);

    const el: any = document.getElementById(
      `subtopic:${selector.subtopic}_${selector.subtopicId}_topic:${selector.topic}_${selector.topicId}`
    );

    if (el) {
      el.checked = false;
    }

    // el.checked = false;

    setSelected(selected.filter((x) => x.subtopicId !== selector.subtopicId));
  };

  useEffect(() => {
    if (areas) {
      setSelected(
        areas.map((x) => {
          {
            return {
              topic: x.topic,
              topicId: x.topicId,
              subtopic: x.subtopic,
              subtopicId: x.subtopicId,
            };
          }
        })
      );
      // selectItemsOnLoad();
      setDisableSave(true);
    }
  }, []);

  return (
    <Box>
      <Stack spacing={"5"} mt="5">
        <Text fontWeight={"semibold"} color="gray.500" fontSize={["sm", "sm", "sm", "md"]}>
          Select your favorite topics and subtopics here to be notified of new
          polls that interest you. Please select at least 3 topics and their
          corresponding subtopics.
        </Text>
        <Box
          rounded={"md"}
          bg="white"
          boxShadow="0 1px 2px hsla(0,0%,0%,0.05),0 1px 4px hsla(0,0%,0%,0.05),0 2px 8px hsla(0,0%,0%,0.05)"
          p="3"
        >
          <Stack fontSize={["sm", "sm", "sm", "md"]} >
            <Text color="poldit.100" fontWeight="semibold">
              Selected Topics and Subtopics
            </Text>
            <Text color="poldit.100">
              {`${selected.length} ${
                selected.length === 1 ? "subtopic" : "subtopics"
              }`}
            </Text>
            <HStack>
              <PoldItActionBtn
                btnLabel="Save"
                btnAction={handleSubmit}
                size="sm"
                loading={areasLoading}
                disabled={selected.length < 3}
              />
              {selected.length > 0 && (
                <PoldItActionBtn
                  btnLabel="Remove All"
                  btnAction={unselectAll}
                  size="sm"
                />
              )}
            </HStack>
            {/* {selected.length > 0 && (
              <HStack>
                <PoldItActionBtn
                  btnLabel="Save"
                  btnAction={handleSubmit}
                  size="sm"
                  loading={areasLoading}
                  disabled={disableSave}
                />

                <PoldItActionBtn
                  btnLabel="Remove All"
                  btnAction={unselectAll}
                  size="sm"
                />
              </HStack>
            )} */}
          </Stack>

          {selected.length === 0 ? (
            <Box color="gray.400"  fontSize={"sm"}>
              All of your selected topics and subtopics will go here..
            </Box>
          ) : (
            <SelectedTags data={selected} remove={removeSelector} />
          )}
        </Box>

        <Center color="poldit.100" fontSize={"lg"}>
          Topics
        </Center>

        {topicsErr ? (
          <BoxError
            msg="Something went wrong!  Please refresh the page and try again."
            h="200px"
          />
        ) : (
          <>
            {topicsLoading ? (
              <Flex justify="center" align="center" minH="300px">
                <Spinner size="lg" color="poldit.100" />
              </Flex>
            ) : (
              <SimpleGrid columns={{ sm: 2, md: 3, lg: 4 }} spacing="8">
                {allTopics.map((x: ProfileTopic) => (
                  <TopicCtr
                    key={x._id}
                    data={x}
                    select={topicHandler}
                    update={updateSTopicRecords}
                    sTopicData={{
                      loading,
                      error,
                      fetchMore,
                    }}
                    updateSelect={updateSelectors}
                  />
                ))}
              </SimpleGrid>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
};

export default AreasInterest;
