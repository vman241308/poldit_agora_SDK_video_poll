import { ApolloError } from "@apollo/client";
import {
  Box,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Spinner,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import {
  ProfileTopic,
  SubTopic_Paginated,
  TopicHandler,
  UpdateSelect,
} from ".";
import { Scrollbars } from "react-custom-scrollbars-2";
import { SubTopicItem } from "./Subtopic";
import { getObjList_NoDuplicates } from "_components/globalFuncs";

interface TopicTag {
  data: ProfileTopic;
  select: TopicHandler;
  update: (topic: string, data: SubTopic_Paginated) => void;
  sTopicData: {
    // data: SubTopic_Paginated;
    // stopics: ISubTopic[];
    loading: boolean;
    error: ApolloError | undefined;
    fetchMore: any;
  };
  updateSelect: UpdateSelect;
}

const TopicCtr = ({
  data,
  select,
  update,
  sTopicData,
  updateSelect,
}: TopicTag) => {
  const scrollRef = useRef(null);

  const onScrollHandler = (e: any) => {
    if (scrollRef && scrollRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = (
        scrollRef.current as any
      ).getValues();

      const bottomReached =
        scrollHeight - Math.round(scrollTop) === clientHeight;

      if (bottomReached && data.subTopic_pages.hasMoreData) {
        sTopicData
          .fetchMore({
            variables: {
              cursor: data.subTopic_pages.cursor,
            },
          })
          .then((res: any) => {
            // console.log(res);
            const {
              cursor,
              data: newStopics,
              hasMoreData,
            } = res.data.subTopicsPerTopic_paginated;

            const newSubTPaginated: SubTopic_Paginated = {
              cursor,
              hasMoreData,
              data: [...data.subTopic_pages.data, ...newStopics],
            };

            update(data.topic, newSubTPaginated);
          });
      }
    }
  };

  return (
    <Accordion
      allowToggle
      onChange={(nextIdx) => {
        select(data.topic);
      }}
    >
      <Box overflowY={"hidden"}>
        <AccordionItem
          rounded={"md"}
          border="1px solid #d6d9dc"
          boxShadow="0 1px 2px hsla(0,0%,0%,0.05),0 1px 4px hsla(0,0%,0%,0.05),0 2px 8px hsla(0,0%,0%,0.05)"
          color="gray.500"
        >
          <AccordionButton
            bg="#f8f9f9"
            _focus={{ outline: "none" }}
            _hover={{ bg: "#f8f9f9" }}
            _expanded={{ bg: "poldit.100", color: "white" }}
          >
            <Box flex="1">
              <Text fontSize={"sm"} fontWeight="semibold">
                {data.topic}
              </Text>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} bg="white" px="0" h="180px">
            <Scrollbars
              style={{
                minHeight: "100%",
                maxHeight: "250px",
                overflowX: "hidden",
              }}
              renderThumbVertical={({ style, ...props }) => (
                <div
                  {...props}
                  style={{
                    ...style,
                    width: "5px",
                    borderRadius: "4px",
                    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.16)",
                    backgroundColor: "#718096",
                  }}
                />
              )}
              ref={scrollRef as any}
              onScroll={onScrollHandler}
            >
              {data.subTopic_pages?.data.map((item) => (
                <SubTopicItem
                  key={item._id}
                  data={item}
                  update={updateSelect}
                  topic={data}
                />
              ))}
            </Scrollbars>
          </AccordionPanel>
        </AccordionItem>
      </Box>
    </Accordion>
  );
};

export default TopicCtr;
