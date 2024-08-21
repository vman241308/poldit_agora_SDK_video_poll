import {
  Box,
  Flex,
  HStack,
  Icon,
  Text,
  useRadio,
  useRadioGroup,
} from "@chakra-ui/react";
import { AiOutlineHistory } from "react-icons/ai";
import { BsChatDots, BsStars } from "react-icons/bs";
import { FiTrendingUp } from "react-icons/fi";

export const PollSideBar = ({ activeBtn, update }: any) => {
  const options = [
    { Icon: AiOutlineHistory, value: "Recent Activity" },
    // { Icon: BsChatDots, value: "Active Chats" },
    { Icon: FiTrendingUp, value: "Trending Polls" },
    { Icon: BsStars, value: "Newest Polls" },
  ];

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "framework",
    defaultValue: activeBtn || "Recent Activity",
    onChange: (e) => update(e),
  });

  const group = getRootProps();
  return (
    <Box ml={{ base: 0, lg: 6 }} mb={{ base: 6, lg: 0 }}>
      <Flex
        {...group}
        wrap="wrap"
        gridGap="2"
        justify="center"
        align="center"
        direction={{ base: "row", lg: "column" }}
      >
        {options?.map((btn) => {
          const radio = getRadioProps({ value: btn.value });
          return (
            <RadioCard key={btn.value} {...radio} icon={btn.Icon}>
              {btn.value}
            </RadioCard>
          );
        })}
      </Flex>
    </Box>
  );
};
const RadioCard = (props: any) => {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        w="100%"
        minW="260px"
        cursor="pointer"
        borderWidth="1px"
        borderColor="gray.400"
        bg="white"
        color="gray.600"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          color: "white",
          bg: "poldit.100",
          // bg: "gray.500",
          borderColor: "gray.500",
        }}
        _focus={{
          outline: "none",
        }}
        px={2}
        py={1}
      >
        <Flex justifyContent={"center"} alignItems="center" p="1">
          <Icon as={props.icon} mr="4" />
          <Text textAlign="center" fontSize="sm">
            {props.children}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};
