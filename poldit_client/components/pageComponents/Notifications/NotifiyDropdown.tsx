import { useState, useEffect, useRef } from "react";
import {
  Avatar,
  Box,
  Flex,
  Text,
  Spinner,
  IconButton,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import Link from "next/link";
import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";
import { NotificationFeed, UserNotification } from "../../appTypes/appType";
import { useQuery, useMutation, ApolloError } from "@apollo/client";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import { updateNotifications } from "../../../lib/apollo/apolloFunctions";
import TimeAgo from "react-timeago";
import { BsGearFill } from "react-icons/bs";
import { NotifySetting } from "./NotifySetting";
import { useAuth } from "_components/authProvider/authProvider";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { getNotifLabel } from "./notifLabel";

const { GET_NOTIFICATIONS_WITH_PAGINATION } = GraphResolvers.queries;

interface NotificationCtr {
  userId: string;
  setShowNotifyDotHandler: (val: boolean) => void;
  setUnreadCount: (val: number) => void;
}

const NotificationContainer = ({
  userId,
  setShowNotifyDotHandler,
  setUnreadCount,
}: NotificationCtr) => {
  const appContext = useAuth();

  const ref: any = useRef(null);

  const {
    isOpen: settingIsOpen,
    onOpen: settingOnOpen,
    onClose: settingOnClose,
  } = useDisclosure();

  const {
    data,
    subscribeToMore,
    error: notificationError,
    fetchMore,
    loading: notifyLoading,
  } = useQuery(GET_NOTIFICATIONS_WITH_PAGINATION, {
    variables: { cursor: "", limit: 10 },
    notifyOnNetworkStatusChange: true,
  });

  const paginateNotify = async () => {
    await fetchMore({
      variables: {
        cursor: data.notificationsWithPagination.cursor,
      },
    });
  };

  const [modifyNotifications] = useMutation(
    GraphResolvers.mutations.UPDATE_NOTIFICATION
  );

  useEffect(() => {
    if (
      data &&
      data?.notificationsWithPagination.totalUnreadNotifications > 0
    ) {
      setShowNotifyDotHandler(true);
      setUnreadCount(
        data?.notificationsWithPagination.totalUnreadNotifications
      );
    } else {
      setShowNotifyDotHandler(false);
      setUnreadCount(0);
    }
  }, [data]);

  useEffect(() => {
    subscribeToMore({
      document: GraphResolvers.subscriptions.NOTIFICATION_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) return prev;
        const newItem = subscriptionData.data.newNotification;

        if (newItem.creator._id !== userId) {
          return Object.assign({}, prev, {
            notificationsWithPagination: {
              ...prev.notificationsWithPagination,
              notifications: [
                newItem,
                ...prev.notificationsWithPagination.notifications,
              ],
              totalUnreadNotifications:
                prev.notificationsWithPagination.totalUnreadNotifications + 1,
            },
          });
        }

        return prev;
      },
    });
  }, []);

  const changeNotifications = (changeId: string = "", cursor: string) => {
    updateNotifications(modifyNotifications, changeId, cursor, 10);
  };

  return (
    <Flex>
      <Box
        bg="gray.50"
        borderRadius="lg"
        overflow="hidden"
        w="100%"
        boxShadow={{
          base: "0 8px 10px -1px rgba(0,0,0,.1)",
          md: "0 1px 10px -1px rgba(0,0,0,.2)",
        }}
        h="500px"
        _focus={{ outline: "none" }}
        _active={{ outline: "none" }}
      >
        <SimpleBar
          style={{
            height: "100%",
            overflowX: "hidden",
            outline: "none !important",
            border: "1px",
          }}
        >
          {/* <Box h="100%" border="1px"> */}
          <Box mt="4" mb="1" mx="4">
            <Flex align="center" justify="space-between">
              <Text fontWeight="bold" fontSize="lg">
                Notifications
              </Text>
              <Flex align="center">
                <Text
                  fontSize="sm"
                  color="blue.300"
                  mr="1"
                  cursor="pointer"
                  _hover={{ textDecoration: "underline" }}
                  onClick={() => changeNotifications("", data?.cursor)}
                >
                  Mark All as read
                </Text>
                {/* <NotificationOptionWindow /> */}
              </Flex>
            </Flex>
          </Box>
          {data?.notificationsWithPagination.loading ? (
            <Flex h="80%" justify="center" align="center">
              <Spinner size="lg" color="poldit.100" />
            </Flex>
          ) : notificationError ? (
            <Flex h="80%" justify="center" align="center">
              <Text color="red.300" fontSize="sm" fontWeight="bold">
                Error! Notifications failed.
              </Text>
            </Flex>
          ) : (
            <Box ref={ref}>
              {data?.notificationsWithPagination.notifications.length === 0 ? (
                <Flex justify="center" align="center" py="2" pt="10">
                  <Text color="gray.500" fontSize="sm">
                    No Notifications
                  </Text>
                </Flex>
              ) : (
                <>
                  {data?.notificationsWithPagination.notifications.map(
                    (notify: any) => (
                      <NotificationItem
                        item={notify}
                        key={notify._id}
                        markRead={changeNotifications}
                      />
                    )
                  )}
                  {data?.notificationsWithPagination.hasMoreData && (
                    <Flex justify="center" align="center" py="2">
                      <Text
                        color="blue.400"
                        fontSize="sm"
                        cursor="pointer"
                        onClick={paginateNotify}
                      >
                        Load more
                      </Text>
                    </Flex>
                  )}
                </>
              )}
            </Box>
          )}
          {/* </Box> */}
        </SimpleBar>
      </Box>
      <NotifySetting isOpen={settingIsOpen} onClose={settingOnClose} />
    </Flex>
  );
};
export default NotificationContainer;

interface NotificationItem {
  item: UserNotification;
  markRead: (id: string, cursor: string) => void;
}

const NotificationItem = ({ item, markRead }: NotificationItem) => (
  <Box
    py="3"
    key={item?._id}
    px="4"
    bg={item.read ? "gray.50" : "gray.200"}
    borderBottom="1px"
    borderBottomColor="gray.300"
  >
    <Flex alignItems="center">
      <Box>
        <Link href={`/Profile/${item?.creator?.appid}`}>
          <Avatar
            name={`${item?.creator?.firstname} ${item?.creator?.lastname}`}
            src={item?.creator?.profilePic}
            cursor="pointer"
            bg="gray.500"
            color="white"
          />
        </Link>
      </Box>
      <Flex direction="column" ml="4" w="100%">
        <Link
          href={`/Polls/${
            item.parentCollectionId
              ? item.parentCollectionId._id
              : item.collectionId
          }`}
        >
          <Box w="90%">
            {getNotifLabel(item)}
            {/* <Text
              fontSize="sm"
              cursor="pointer"
              _hover={{ color: "blue.400" }}
              noOfLines={2}
              mb="2"
            >
              {item?.message}
            </Text> */}
          </Box>
        </Link>

        <Flex align="center" justify="space-between">
          <Text fontSize="xs" color="gray.500">
            <TimeAgo date={item?.creationDate} live={false} />
          </Text>
          {!item.read && (
            <Text
              fontSize="xs"
              color="blue.400"
              cursor="pointer"
              mr="1"
              _hover={{ textDecoration: "underline" }}
              onClick={() => markRead(item._id, "")}
            >
              Mark as read
            </Text>
          )}
        </Flex>
      </Flex>
    </Flex>
  </Box>
);

const NotificationOptionWindow = () => {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="dotMenu"
        icon={<BiDotsVerticalRounded size="20px" />}
        variant="ghost"
        _focus={{ outline: "none" }}
        _hover={{ bg: "none" }}
        _active={{ bg: "none" }}
        size="xs"
        color="gray.500"
      />
      <MenuList p="2">
        <MenuItem
          _focus={{ outline: "none" }}
          _hover={{ bg: "gray.200", rounded: "md" }}
        >
          Edit
        </MenuItem>

        <MenuItem
          _focus={{ outline: "none" }}
          _hover={{ bg: "gray.200", rounded: "md" }}
        >
          Report
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
