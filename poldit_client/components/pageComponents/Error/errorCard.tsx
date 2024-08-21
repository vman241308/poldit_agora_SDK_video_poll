import { Box, Text, Stack, Center } from "@chakra-ui/react";
import { BiErrorCircle } from "react-icons/bi";

interface ErrorCard {
  msg: string;
  iconSize: string;
  txtSize: "xs" | "sm" | "md" | "lg" | "xl";
}

const ErrorCard = ({ msg, iconSize, txtSize }: ErrorCard) => {
  return (
    <Stack spacing="2" color="gray.400">
      <Center>
        <BiErrorCircle size={iconSize} />
      </Center>
      <Text size={txtSize}>{msg}</Text>
    </Stack>
  );
};

export default ErrorCard;
