import { Box, Flex, Spinner, Tag, TagLabel } from "@chakra-ui/react";
import React from "react";
import { InfoBtn } from "../Other/Button/miscButtons";
import { InfoHeader } from "./other";
import Searchbar from "./Searchbar";
import { ITopicProps } from "./topic_types";
import TopicBox from "./topics";
import { ITopic } from "_components/appTypes/appType";
import { handleStorage } from "_components/formFuncs/formFuncs";
import { numCountDisplay } from "_components/formFuncs/miscFuncs";
import { useRouter } from "next/router";

interface IProps extends ITopicProps {}

const TopicCtr = (props: IProps) => {
  const router = useRouter();

  return (
    <Box>
      <InfoHeader
        title="Topics"
        mssg="Select a topic to see all polls associated with it. The number shown on each button represents the number of polls for that topic."
      />
      <Flex gridGap="2" mt="4" wrap="wrap">
        {props.loading ? (
          <Flex justify="center" align="center" minH="300px" w="100%">
            <Spinner size="lg" color="poldit.100" />
          </Flex>
        ) : (
          <>
            {props.topics.map((x: ITopic) => (
              <Tag
                fontWeight="bold"
                color="gray.100"
                borderRadius="full"
                _focus={{ outline: "none" }}
                bg={
                  props.selected?.topic === x.topic ? "poldit.100" : "gray.400"
                }
                key={x._id}
                px="3"
                py="1"
                onClick={() => {
                  router.query.id &&
                    router.push(router.pathname, undefined, { shallow: true });
                  props.update(x._id, "topic", true);
                  handleStorage("PoldIt-data", "tags", {
                    id: x._id,
                    tagType: "topic",
                  });
                }}
                cursor="pointer"
                size="sm"
              >
                <TagLabel>{x.topic}</TagLabel>
                <TagLabel ml="15px">
                  {x.numPolls && numCountDisplay(x.numPolls)}
                </TagLabel>
              </Tag>
            ))}
          </>
        )}
      </Flex>
      {/* <TopicBox
        loading={props.loading}
        data={props.topics}
        selected={props.selected}
        update={props.update}
        showAll={true}
      /> */}
    </Box>
  );
};

export default TopicCtr;
