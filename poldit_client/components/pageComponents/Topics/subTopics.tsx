import { Flex, Spinner, Tag, TagLabel } from "@chakra-ui/react";
import { ISubTopic } from "_components/appTypes/appType";
import { handleStorage } from "_components/formFuncs/formFuncs";
import { numCountDisplay } from "_components/formFuncs/miscFuncs";

interface SubTopicBox {
  loading: boolean;
  data: ISubTopic[];
  selected: ISubTopic | null | undefined;
  update: (btnType: string, id: string) => void;
}

const subTopicBox = ({ loading, data, selected, update }: SubTopicBox) => {
  return (
    <Flex gridGap="2" mt="4" wrap="wrap">
      {loading ? (
        <Flex justify="center" align="center" minH="300px" w="100%">
          <Spinner size="lg" color="poldit.100" />
        </Flex>
      ) : (
        data.map((x: ISubTopic) => (
          <Tag
            fontWeight="bold"
            color={selected?.subTopic === x.subTopic ? "white" : "gray.500"}
            variant={"outline"}
            borderRadius="full"
            bg={selected?.subTopic === x.subTopic ? "poldit.100" : "none"}
            key={x._id}
            px="3"
            py="1.5"
            onClick={() => {
              update("subTopic", x._id);
              handleStorage("PoldIt-data", "tags", {
                id: x._id,
                tagType: "subTopic",
              });
            }}
            cursor="pointer"
            size="sm"
          >
            <TagLabel>{x.subTopic}</TagLabel>

            <TagLabel ml="15px">
              {x.numPolls && numCountDisplay(x.numPolls)}
            </TagLabel>
          </Tag>
        ))
      )}
    </Flex>
  );
};

export default subTopicBox;
