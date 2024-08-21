import { HStack, Text, Box, Flex, IconButton } from "@chakra-ui/react";
import { ISubTopic, ITopic } from "_components/appTypes/appType";
import { Selected, UpdateSelect } from ".";
import { Scrollbars } from "react-custom-scrollbars-2";
import { CloseBtn_custom } from "../Other/Button/miscButtons";
import { RiCloseFill } from "react-icons/ri";

interface SubTopicItem {
  data: ISubTopic;
  update: UpdateSelect;
  topic: ITopic;
}

export const SubTopicItem = ({ data, update, topic }: SubTopicItem) => (
  <HStack spacing="3" color="gray.500" fontSize="sm" p="2">
    <input
      type="checkbox"
      id={`subtopic:${data.subTopic}_${data._id}_topic:${topic.topic}_${topic._id}`}
      onChange={update}
    />
    <Text>{data.subTopic}</Text>
  </HStack>
);

interface SelectedTags {
  data: Selected[];
  remove: (item: Selected) => void;
}

export const SelectedTags = ({ data, remove }: SelectedTags) => {
  return (
    <Box>
      <Scrollbars style={{ height: "100px" }}>
        <Flex mt="5" gridGap="2" wrap="wrap" overflow={"hidden"}>
          {data.map((x, idx) => (
            <HStack
              spacing="3"
              key={idx}
              rounded="md"
              bg="poldit.100"
              fontSize={"xs"}
              p="1"
              pl="3"
            >
              <Box
                color="white"
                fontWeight={"semibold"}
              >{`${x.topic}: ${x.subtopic}`}</Box>
              <IconButton
                aria-label="Call Sage"
                size={"xs"}
                fontSize={"16px"}
                _focus={{ outline: "none" }}
                rounded="md"
                icon={<RiCloseFill />}
                onClick={() => remove(x)}
              />
            </HStack>
          ))}
        </Flex>
      </Scrollbars>
    </Box>
  );
};
