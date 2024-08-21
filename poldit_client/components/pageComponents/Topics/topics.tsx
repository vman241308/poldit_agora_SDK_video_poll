import { Flex, Spinner, Tag, TagLabel } from "@chakra-ui/react";
import { ITopic } from "_components/appTypes/appType";
import { handleStorage } from "_components/formFuncs/formFuncs";
import { numCountDisplay } from "_components/formFuncs/miscFuncs";

interface TopicBox {
  loading: boolean;
  data: ITopic[];
  selected: ITopic | null | undefined;
  update: (btnType: string, id: string) => void;
  showAll: boolean;
}

const topicBox = ({ loading, data, selected, update, showAll }: TopicBox) => {
  const numPolls = data
    ? data.reduce((acc, curr) => acc + (curr.numPolls as number), 0)
    : 0;

  return (
    <Flex gridGap="2" mt="4" wrap="wrap">
      {loading ? (
        <Flex justify="center" align="center" minH="300px" w="100%">
          <Spinner size="lg" color="poldit.100" />
        </Flex>
      ) : (
        <>
          {showAll && (
            <AllBtn update={update} numPolls={numPolls} selected={selected} />
          )}
          {data.map((x: ITopic) => (
            <Tag
              fontWeight="bold"
              color="gray.100"
              borderRadius="full"
              bg={selected?.topic === x.topic ? "poldit.100" : "gray.400"}
              key={x._id}
              px="3"
              py="1"
              onClick={() => {
                update("topic", x._id);
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
  );
};

export default topicBox;

interface AllBtn {
  update: (btnType: string, id: string) => void;
  numPolls: number;
  selected: ITopic | null | undefined;
}

export const AllBtn = ({ update, numPolls, selected }: AllBtn) => {
  return (
    <Tag
      fontWeight="bold"
      color="gray.100"
      borderRadius="full"
      onClick={() => {
        update("topic", "All_1");
        handleStorage("PoldIt-data", "tags", {
          id: "All_1",
          tagType: "topic",
        });
      }}
      bg={selected?.topic === "All Topics" ? "poldit.100" : "gray.400"}
      px="3"
      py="1"
      cursor="pointer"
      size="sm"
    >
      <TagLabel>All Topics</TagLabel>
      <TagLabel ml="15px">{numCountDisplay(numPolls)}</TagLabel>
    </Tag>
  );
};
