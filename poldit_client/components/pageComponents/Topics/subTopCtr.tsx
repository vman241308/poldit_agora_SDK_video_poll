import {
  Box,
  Flex,
  Alert,
  AlertIcon,
  Spinner,
  Tag,
  TagLabel,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { ISubTopic } from "_components/appTypes/appType";
import { handleStorage } from "_components/formFuncs/formFuncs";
import { numCountDisplay } from "_components/formFuncs/miscFuncs";
import { capitalizeWord } from "_components/globalFuncs";
import { InfoHeader } from "./other";
import { ISubtopicProps } from "./topic_types";

interface IProps extends ISubtopicProps {}

const SubtopicCtr = (props: IProps) => {
  const router = useRouter();

  return (
    <Box>
      <InfoHeader
        title="Subtopics"
        mssg="Select a subtopic to see all polls associated with it. The number shown on each button represents the number of polls for that subtopic."
      />
      <Flex gridGap="2" mt="4" wrap="wrap">
        {props.selectedTopic ? (
          <>
            {props.error ? (
              <>
                <Flex justify="center" align="center" w="100%" p="2">
                  <Alert status="error" fontSize={"sm"}>
                    <AlertIcon />
                    Something went wrong. Refresh the page to get Topics
                  </Alert>
                </Flex>
              </>
            ) : (
              <>
                {props.loading ? (
                  <Flex justify="center" align="center" w="100%">
                    <Spinner size="lg" color="poldit.100" />
                  </Flex>
                ) : (
                  <>
                    {props?.subtopics?.subtopics.map((x: ISubTopic, idx) => (
                      <Tag
                        fontWeight="bold"
                        _focus={{ outline: "none" }}
                        color={
                          props.selected?.subTopic === x.subTopic
                            ? "white"
                            : "gray.500"
                        }
                        variant={"outline"}
                        borderRadius="full"
                        bg={
                          props.selected?.subTopic === x.subTopic
                            ? "poldit.100"
                            : "none"
                        }
                        key={idx}
                        px="3"
                        py="1.5"
                        onClick={() => {
                          router.query.id &&
                            router.push(router.pathname, undefined, {
                              shallow: true,
                            });
                          props.update(x._id, "subtopic", true);
                          handleStorage("PoldIt-data", "tags", {
                            id: x._id,
                            topic: props.selectedTopic?._id,
                            tagType: "subTopic",
                          });
                        }}
                        cursor="pointer"
                        size="sm"
                      >
                        <TagLabel>{capitalizeWord(x.subTopic)}</TagLabel>
                        <TagLabel ml="15px">
                          {x.numPolls && numCountDisplay(x.numPolls)}
                        </TagLabel>
                      </Tag>
                    ))}
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <Box color="red.400" fontWeight={"semibold"} fontSize={"md"}>
            Please Select a Topic to see the Subtopics
          </Box>
        )}
      </Flex>
    </Box>
  );
};

export default SubtopicCtr;
