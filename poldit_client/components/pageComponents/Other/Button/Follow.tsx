import {
  Box,
  Container,
  Flex,
  HStack,
  IconButton,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  Tooltip,
  useDisclosure,
  Avatar,
  useToast,
  Button,
} from "@chakra-ui/react";
import { BsPlusCircle } from "react-icons/bs";
import { BiMinusCircle } from "react-icons/bi";
import { Follower, User } from "_components/appTypes/appType";
import { useQuery, useMutation } from "@apollo/client";
import GraphResolvers from "../../../../lib/apollo/apiGraphStrings";
import { useEffect, useState } from "react";
import { followHandlerForUser } from "lib/apollo/apolloFunctions/mutations";

interface FollowBtn {
  user: User;
  btnStyle?: any;
  appUserId: string;
}

export const FollowBtn = ({ user, btnStyle, appUserId }: FollowBtn) => {
  const toast = useToast();
  const { iconSize, color } = btnStyle;

  const [btn, toggleBtn] = useState(false);
  // const { data } = useQuery(GraphResolvers.queries.GET_APP_USER_FOLLOWERS);

  const [toggleFollow] = useMutation(GraphResolvers.mutations.HANDLE_FOLLOW, {
    onCompleted: (res) =>
      toast({
        title: res.handleFollow,
        status: "success",
        isClosable: true,
        duration: 2000,
      }),
    onError: (err) =>
      toast({
        title: "Something went wrong!  Please refresh the page and try again.",
        status: "error",
        isClosable: true,
        duration: 2000,
      }),
  });

  const handleFollow = () => {
    toggleBtn(!btn);

    const followUser = {
      _id: user._id,
      appId: user.appid,
      profilePic: user.profilePic,
      isFollowed: btn,
      firstname: user.firstname,
      lastname: user.lastname,
      isActive: user.isActive,
      removeFromFollowerList: btn && appUserId,
    };

    followHandlerForUser(toggleFollow, JSON.stringify(followUser), user.appid);
    // toggleFollow({
    //   variables: { details: JSON.stringify(followUser) },
    // });
  };

  useEffect(() => {
    if (appUserId) {
      const foundAppUser = user.followers?.some(
        (item) => item._id === appUserId
      );
      foundAppUser && toggleBtn(foundAppUser);
    }
  }, []);

  // useEffect(() => {
  //   if (data) {
  //     const userData = data.getFollows.some(
  //       (item: any) => item.appId === user.appid
  //     );

  //     userData && toggleBtn(userData);
  //   }
  // }, [data]);

  return (
    <Flex ml="2" mt="1">
      <Tooltip
        hasArrow
        placement="top"
        label={btn ? `Unfollow ${user.appid}` : `Follow ${user.appid}`}
      >
        <span>
          <IconButton
            aria-label="profile-setting"
            icon={
              btn ? (
                <BiMinusCircle size={iconSize} />
              ) : (
                <BsPlusCircle size={iconSize} />
              )
            }
            onClick={handleFollow}
            size="xs"
            color={color}
            isRound
            bg="none"
            _focus={{ outline: "none", bg: "none" }}
            _hover={{ bg: color, color: "white" }}
            _active={{ bg: "none" }}
          />
        </span>
      </Tooltip>
    </Flex>
  );
};

export const FollowBtn_Lg = ({ user, appId }: any) => {
  const [btn, toggleBtn] = useState(false);
  const toast = useToast();

  // const { data } = useQuery(GraphResolvers.queries.GET_APP_USER_FOLLOWERS);

  const [toggleFollow] = useMutation(GraphResolvers.mutations.HANDLE_FOLLOW, {
    onCompleted: (res) =>
      toast({
        title: res.handleFollow,
        status: "success",
        isClosable: true,
        duration: 2000,
      }),
    onError: (err) =>
      toast({
        title: "Something went wrong!  Please refresh the page and try again.",
        status: "error",
        isClosable: true,
        duration: 2000,
      }),
  });

  const updateHandler = () => {
    toggleBtn(!btn);

    const followUser = {
      _id: user._id,
      appId: user.appId,
      profilePic: user.profilePic,
      isFollowed: btn,
      firstname: user.firstname,
      lastname: user.lastname,
      isActive: user.isActive,
    };

    followHandlerForUser(toggleFollow, JSON.stringify(followUser), appId);
  };

  useEffect(() => {
    toggleBtn(user.isFollowed);
  }, []);

  return (
    <Button
      variant="ghost"
      _focus={{ outline: "none" }}
      borderWidth="1px"
      borderColor="#dbdbdb"
      size="sm"
      onClick={updateHandler}
    >
      {btn ? "Unfollow" : "Follow"}
    </Button>
  );
};
