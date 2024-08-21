import { Box, Flex, Stack, Tag } from "@chakra-ui/react";
import React from "react";
import { ITopic, PollHistory } from "_components/appTypes/appType";
import Link from "next/link";

interface IProps {
  data: PollHistory;
}

const EmbedTags = ({ data }: IProps) => {
  return (
    <>
      {data.topics &&
      data.topics?.length > 0 &&
      data.keywords &&
      data.keywords?.length > 0 ? (
        <AITags data={data} />
      ) : (
        <>
          {data.topic && data.topic.topic !== "" && (
            <Flex wrap="wrap" gridGap="2">
              <Link
                href={{
                  pathname: "/Topics",
                  query: { id: data.topic._id, tagType: "topic" },
                }}
                as={"/Topics"}
              >
                <Tag
                  id="topic_tag"
                  fontWeight="bold"
                  color="gray.100"
                  size="sm"
                  borderRadius="full"
                  bg="poldit.100"
                  cursor="pointer"
                >
                  {data?.topic?.topic}
                </Tag>
              </Link>
              {data?.subTopics?.map((st) => (
                <Link
                  href={{
                    pathname: "/Topics",
                    query: {
                      id: st._id,
                      tagType: "subTopic",
                      topic: st.topic?._id,
                    },
                  }}
                  as={"/Topics"}
                  key={st._id}
                >
                  <Tag
                    id="subtopic_tag"
                    fontWeight="bold"
                    color="gray.500"
                    size="sm"
                    borderRadius="full"
                    cursor="pointer"
                  >
                    {st.subTopic}
                  </Tag>
                </Link>
              ))}
            </Flex>
          )}
        </>
      )}
    </>
  );
};

export default EmbedTags;

const AITags = ({ data }: IProps) => {
  return (
    <Stack>
      <Flex wrap="wrap" gridGap="2">
        {data.topics &&
          data.topics?.length > 0 &&
          data.topics?.map((x: ITopic) => (
            <Tag
              key={x._id}
              id="topic_tag"
              fontWeight="bold"
              color="gray.100"
              size="sm"
              borderRadius="full"
              bg="poldit.100"
              cursor="pointer"
            >
              {x.topic}
            </Tag>
          ))}
      </Flex>
      <Flex wrap="wrap" gridGap="2">
        {data.keywords &&
          data.keywords.length > 0 &&
          data.keywords?.map((x, idx) => (
            <Tag
              key={idx}
              id="keyword_tag"
              fontWeight="bold"
              color="gray.500"
              size="sm"
              borderRadius="full"
              cursor="pointer"
            >
              {x}
            </Tag>
          ))}
      </Flex>
    </Stack>
  );
};

{
  /* {data.topic && (
        <Flex wrap="wrap" gridGap="2">
          <Link
            href={{
              pathname: "/Topics",
              query: { id: data.topic._id, tagType: "topic" },
            }}
            as={"/Topics"}
          >
            <Tag
              id="topic_tag"
              fontWeight="bold"
              color="gray.100"
              size="sm"
              borderRadius="full"
              bg="poldit.100"
              cursor="pointer"
            >
              {data?.topic?.topic}
            </Tag>
          </Link>
          {data?.subTopics?.map((st) => (
            <Link
              href={{
                pathname: "/Topics",
                query: { id: st._id, tagType: "subTopic" },
              }}
              as={"/Topics"}
              key={st._id}
            >
              <Tag
                id="subtopic_tag"
                fontWeight="bold"
                color="gray.500"
                size="sm"
                borderRadius="full"
                cursor="pointer"
              >
                {st.subTopic}
              </Tag>
            </Link>
          ))}
        </Flex>
      )} */
}
