import {
  Avatar,
  Box,
  Flex,
  IconButton,
  Image,
  Spinner,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import Link from "next/link";
import { useMutation, ApolloError } from "@apollo/client";
// import { Scrollbars } from "react-custom-scrollbars-2";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from "react-icons/ai";
import { BiErrorCircle, BiMessage } from "react-icons/bi";

import { ChatUser } from "_components/appTypes/appType";
import { followHandler } from "lib/apollo/apolloFunctions/mutations";
import Scrollbars from "_components/pageComponents/Other/Scrollbar";

interface UserTab {
  data: ChatUser[];
  loading: boolean;
  error: ApolloError | undefined;
  appUser: string;
  pollId: string | string[] | undefined;
}

const UserTab = ({ data, loading, error, appUser, pollId }: UserTab) => {
  const [toggleFollow] = useMutation(GraphResolvers.mutations.HANDLE_FOLLOW);

  const handleFollow = (user: ChatUser) => {
    followHandler(toggleFollow, JSON.stringify(user));
  };

  if (loading) {
    return (
      <Box>
        <Flex align="center" justify="center" minH="600px">
          <Spinner size="lg" />
        </Flex>
      </Box>
    );
  }
  if (error) {
    return (
      <Box>
        <Flex align="center" justify="center" minH="600px">
          <Flex justify="center" direction="column" align="center">
            <BiErrorCircle color="#718096" size="26px" />
            <Text color="gray.500" mt="2" fontSize="sm">
              Error! Cannot load Users.
            </Text>
          </Flex>
        </Flex>
      </Box>
    );
  }
  return (
    <Box bg="white" overflowX="hidden">
      <Scrollbars style={{ height: "845px" }}>
        {data.map((x: any) => (
          <UserListItem
            key={x.id}
            user={x}
            handleFollow={handleFollow}
            appUser={appUser}
          />
        ))}
      </Scrollbars>
    </Box>
  );
};

export default UserTab;

interface UserListItem {
  user: ChatUser;
  handleFollow: (user: ChatUser) => void;
  appUser: string;
}

const UserListItem = ({ user, handleFollow, appUser }: UserListItem) => {
  const isAppUser = appUser === user.id;

  return (
    <Box bg="#f2f2f2" my="2" mx={[1, 1, 3]} borderRadius="lg">
      <Flex py="4" px={[1, 1, 4]} align="center" justify="space-between">
        <Flex align="center">
          {!isAppUser ? (
            <Tooltip
              hasArrow
              placement="top"
              label={!user.isFollowed ? "Follow" : "Unfollow"}
            >
              <IconButton
                icon={
                  !user.isFollowed ? (
                    <AiOutlinePlusCircle size="23px" />
                  ) : (
                    <AiOutlineMinusCircle size="23px" />
                  )
                }
                onClick={() => handleFollow(user)}
                aria-label="thumbsup"
                variant="ghost"
                _focus={{ outline: "none" }}
                _hover={{ bg: "none" }}
                _active={{ bg: "none" }}
                size="sm"
                color="gray.800"
              />
            </Tooltip>
          ) : (
            <Box mr="32px" />
          )}
          <Box mx="3" position="relative">
            <Link href={`/Profile/${user.appid}`}>
              <Avatar
                name={user.fullName}
                src={user?.profilePic}
                bg="gray.500"
                color="white"
                size="md"
                cursor="pointer"
              />
            </Link>
            <Box
              position="absolute"
              w="9px"
              h="9px"
              borderRadius="50%"
              bg={user?.isActive ? "green.300" : "gray.400"}
              top="2px"
              right="3px"
            ></Box>
          </Box>
          <Box>
            <Text
              color="gray.600"
              fontSize={["sm", "sm", "md"]}
              maxW="80px"
              isTruncated
            >
              {user?.appid}
            </Text>
          </Box>
        </Flex>
        <Flex align="center">
          <Tooltip hasArrow placement="top" label="Polls">
            <Flex align="center" minW="60px">
              <Image src="/P-10.png" w="20px" />
              <Text color="gray.600" ml="2" fontSize={["xs", "xs", "sm"]}>
                {user?.numPolls}
              </Text>
            </Flex>
          </Tooltip>
          <Tooltip hasArrow placement="top" label="Answers">
            <Flex align="center" ml="6" minW="60px">
              <BiMessage size="20px" />
              <Text color="gray.600" ml="2" fontSize={["xs", "xs", "sm"]}>
                {user?.numAnswers}
              </Text>
            </Flex>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  );
};
