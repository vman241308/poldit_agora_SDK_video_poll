import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Tag,
  TagLabel,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import { ITopic } from "_components/appTypes/appType";
import { numCountDisplay } from "_components/formFuncs/miscFuncs";

interface TopicWindow {
  data: ITopic[];
  loading: boolean;
}

const TopicWindow = ({ data, loading }: TopicWindow) => {
  return (
    <Box ml={{ base: 0, lg: 6 }} mb={{ base: 6, lg: 0 }} mt={3}>
      <Flex
        wrap="wrap"
        gridGap="2"
        justify="center"
        align="center"
        direction={{ base: "row", lg: "column" }}
      >
        <Box>
          <Box
            w="100%"
            minW="260px"
            maxW="260px"
            cursor="pointer"
            borderWidth="1px"
            borderColor="gray.400"
            bg="white"
            color="gray.600"
            borderRadius="md"
            boxShadow="md"
            _checked={{
              color: "white",
              bg: "gray.500",
              borderColor: "gray.500",
            }}
            _focus={{
              outline: "none",
            }}
            // px={2}
            // py={1}
          >
            <Accordion allowToggle>
              <AccordionItem>
                <h2>
                  <AccordionButton
                    _focus={{ outline: "none" }}
                    _hover={{ bg: "#f8f9f9" }}
                  >
                    <Box flex="1" textAlign="left">
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        textAlign="center"
                      >
                        Poll Topics
                      </Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Flex gridGap="2" mt="4" wrap="wrap">
                    {data.map((item) => (
                      <TopicBtn data={item} key={item._id} />
                    ))}
                  </Flex>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default TopicWindow;

export const TopicBtn = ({ data }: { data: ITopic }) => (
  <Link
    href={{
      pathname: "/Topics",
      query: { id: data._id, tagType: "topic" },
    }}
    as={"/Topics"}
  >
    <Tag
      fontWeight="bold"
      color="gray.100"
      borderRadius="full"
      bg="gray.400"
      _hover={{ bg: "poldit.100" }}
      px="3"
      py="1"
      cursor="pointer"
      size="sm"
    >
      <TagLabel>{data.topic}</TagLabel>
      <TagLabel ml="15px">
        {data.numPolls && numCountDisplay(data.numPolls)}
      </TagLabel>
    </Tag>
  </Link>
);
