import { Flex, Box, Text } from "@chakra-ui/react";
import { IconType } from "react-icons/lib";

interface CustomToast {
  msg: string;
  Icon?: IconType;
  bg: string;
  fontColor: string;
  iconSize: string;
}

const CustomToast = ({ msg, Icon, bg, fontColor, iconSize }: CustomToast) => (
  <Flex
    bg={bg}
    id="custom_toast"
    p="5"
    alignItems={"center"}
    justifyContent="space-between"
    rounded={"md"}
  >
    {Icon && (
      <Box>
        <Icon color={fontColor} size={iconSize} />
      </Box>
    )}
    <Box flex="1" ml="2">
      <Text fontWeight="semibold"  color={fontColor}>
        {msg}
      </Text>
    </Box>
  </Flex>
);

export default CustomToast;
