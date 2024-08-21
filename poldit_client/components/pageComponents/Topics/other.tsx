import { HStack, Text, Box } from "@chakra-ui/react";
import { InfoBtn } from "../Other/Button/miscButtons";

interface IInfoProps {
  title: string;
  mssg: string;
}

export const InfoHeader = ({title, mssg}: IInfoProps) => (
  <HStack>
    <Text color="gray.700" fontWeight="bold" fontSize="lg">
      {title}
    </Text>
    <Box>
      <InfoBtn
        msgTxt={mssg}
        size="16px"
        placement="left"
      />
    </Box>
  </HStack>
);
