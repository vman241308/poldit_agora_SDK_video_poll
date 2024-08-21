import { Avatar, Box, Flex, Text, Tooltip } from "@chakra-ui/react";
import { FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import TimeAgo from "react-timeago";
import { IoIosReturnRight } from "react-icons/io";
import Link from "next/link";
import { User } from "_components/appTypes/appType";

interface SearchUser {
  data: User[];
}

const SearchUser = ({ data }: SearchUser) => {
  if (!data || !data.length) {
    return null;
  }
  return (
    <Flex mt="2" pb="8" flexDirection={"column"} alignItems="center">
      {data.map((x) => (
        <Flex
          key={x?._id}
          w={{sm: "100%", md: "80%", lg: "50%"}}
          bg="white"
          overflow="hidden"
          alignItems={"center"}
          boxShadow="0 1px 10px -1px rgba(0,0,0,.2)"
          borderRadius="lg"
          mb="8"
          p="5"
        >
          <Box position={"relative"}>
            <Link href={`/Profile/${x?.appid}`}>
              <Avatar
                name={`${x.firstname} ${x.lastname}`}
                src={x?.profilePic}
                border="none"
                cursor="pointer"
                bg="gray.500"
                color="white"
              />
            </Link>
            {x.isActive && (
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
                  right="3px"
                ></Box>
              </Tooltip>
            )}
          </Box>
          <Text color="gray.500" ml="6">
            {x?.appid}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
};

export default SearchUser;
