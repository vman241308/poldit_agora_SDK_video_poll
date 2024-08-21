import {
  Avatar,
  Box,
  Flex,
  HStack,
  Spinner,
  Tooltip,
  Text,
} from "@chakra-ui/react";
import { User } from "_components/appTypes/appType";
import Scrollbars from "_components/pageComponents/Other/Scrollbar";
// import { Scrollbars } from "react-custom-scrollbars-2";

interface UserRefBox {
  data: User[];
  loading: boolean;
  select: (appid: string) => void;
}

const UserRefBox = ({ data, loading, select }: UserRefBox) => {
  return (
    <Box
      position={"absolute"}
      rounded="md"
      w="250px"
      h="300px"
      bottom="20"
      bg="white"
      zIndex={"10"}
      borderRadius="18px 18px 18px 0"
      boxShadow="0 0 32px rgb(0 0 0 / 8%), 0rem 16px 16px -16px rgb(0 0 0 / 10%);"
    >
      <Box pt="2" pb="2">
        <Scrollbars style={{ height: "285px" }}>
          {loading ? (
            <Flex justifyContent="center" alignItems={"center"} h="100%">
              <Spinner size="md" color="poldit.100" />
            </Flex>
          ) : (
            <Flex flexDirection={"column"} pr="3" pl="1" pt="2">
              {data.map((item: User) => (
                <BoxContent key={item._id} data={item} select={select} />
              ))}
            </Flex>
          )}
        </Scrollbars>
      </Box>
    </Box>
  );
};

export default UserRefBox;

interface BoxContent {
  data: User;
  select: (appid: string) => void;
}

const BoxContent = ({ data, select }: BoxContent) => (
  <Box
    p="2"
    onClick={() => select(data.appid)}
    _hover={{ bg: "gray.200" }}
    cursor="pointer"
    rounded={"md"}
    mb="2"
  >
    <HStack spacing={"2"}>
      <Box position={"relative"}>
        <Avatar
          name={`${data.firstname} ${data.lastname}`}
          size={"sm"}
          src={data?.profilePic}
          border="none"
          bg="gray.500"
          color="white"
        />

        {data.isActive && (
          <Tooltip
            label="Active"
            hasArrow
            placement="right-end"
            fontSize={"xs"}
          >
            <Box
              position="absolute"
              w="10px"
              h="10px"
              borderRadius="50%"
              bg="green.300"
              bottom="1"
              right="-0.5"
            ></Box>
          </Tooltip>
        )}
      </Box>

      <Text fontSize={"sm"} color="gray.500">
        {data.appid}
      </Text>
    </HStack>
  </Box>
);
