import { Flex, HStack, Text, Select } from "@chakra-ui/react";
import { IconType } from "react-icons/lib";
import { MdArrowDropDown } from "react-icons/md";

interface ContentFilterProps {
  btns: {
    btnName: string;
    title: string;
    icon?: IconType | undefined;
    active?: boolean;
  }[];
  sortBy: string;
  sort: (val: string) => void;
  content: string;
}

const ContentFilter = (props: ContentFilterProps) => {
  return (
    <Flex alignItems="center" justifyContent="flex-start" mt="2">
      <HStack w="100%" spacing={"3"} color="white">
        <Text fontSize="sm" w="50%">{`Sort ${props.content} by`}</Text>
        <Select
          variant={"outline"}
          fontSize="sm"
          bg="gray.700"
          size="xs"
          minW="max-content"
          icon={<MdArrowDropDown />}
          value={props.sortBy}
          _focus={{ outline: "none" }}
          onChange={(val) => props.sort(val.target.value)}
        >
          {props.btns.map((x, idx) => (
            <option
              key={idx}
              value={x.btnName}
              style={{ backgroundColor: "#2D3748", margin: "5px" }}
            >
              {x.title}
            </option>
          ))}
        </Select>
      </HStack>
    </Flex>
  );
};

export default ContentFilter;
