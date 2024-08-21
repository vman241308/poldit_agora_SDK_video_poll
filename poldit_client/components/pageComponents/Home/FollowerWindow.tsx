import {
  Avatar,
  Badge,
  Box,
  Center,
  Flex,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import Link from "next/link";
import { useEffect } from "react";
import { useQuery } from "@apollo/client";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import { Follower } from "_components/appTypes/appType";
import { showAbbreviatedTxt } from "_components/globalFuncs";
import { InfoBtn } from "../Other/Button/miscButtons";
import { richTxt_toTxt } from "../Other/RichText/richTxtFuncs";
import Scrollbars from "_pageComponents/Other/Scrollbar";
import { numCountDisplay } from "_components/formFuncs/miscFuncs";

const FollowerWindow = ({ followers }: { followers: string[] }) => {
  const { data, loading, error, subscribeToMore } = useQuery(
    GraphResolvers.queries.GET_FOLLOW_ACTIVITY
  );

  const followerData = data?.getFollowActivity.filter((item: Follower) => {
    if (followers.includes(item.appId)) {
      return item;
    }
  });

  // const {
  //   data: followerData,
  //   loading: followerLoading,
  //   error: followerError,
  //   subscribeToMore: followerSubscribeMore,
  // } = useQuery(GraphResolvers.queries.GET_FOLLOWER_ONLY_ACTIVITY);

  useEffect(() => {
    subscribeToMore({
      document: GraphResolvers.subscriptions.FOLLOWER_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const follower: Follower = subscriptionData.data.newFollower;

        if (follower && follower.removeFlag) {
          const updatedFollowerList = prev?.getFollowActivity?.filter(
            (item: Follower) => item.userId !== follower.userId
          );

          return { getFollowActivity: updatedFollowerList };
        }

        const prevMatch = prev?.getFollowActivity.some(
          (item: Follower) => item.userId === follower.userId
        );

        if (prevMatch) {
          return prev;
        }

        return { getFollowActivity: [...prev?.getFollowActivity, follower] };
      },
    });
  }, []);

  // useEffect(() => {
  //   followerSubscribeMore({
  //     document: GraphResolvers.subscriptions.FOLLOWER_SUBSCRIPTION,
  //     updateQuery: (prev, { subscriptionData }) => {
  //       if (!subscriptionData.data) return prev;
  //       const follower: Follower = subscriptionData.data.newFollower;

  //       if (follower && follower.remove) {
  //         const updatedFollowerList = prev?.getFollowerOnlyActivity?.filter(
  //           (item: Follower) => item._id !== follower._id
  //         );

  //         return { getFollowerOnlyActivity: updatedFollowerList };
  //       }

  //       const prevMatch = prev?.getFollowerOnlyActivity.some(
  //         (item: Follower) => item._id === follower._id
  //       );

  //       if (prevMatch) {
  //         return prev;
  //       }

  //       return {
  //         getFollowerOnlyActivity: [...prev?.getFollowerOnlyActivity, follower],
  //       };
  //     },
  //   });
  // }, [followerData]);

  return (
    <Flex flexDirection={"column"}>
      <Center mb="3">
        <Text color={"gray.500"} fontSize="lg" fontWeight="semibold">
          Users Online
        </Text>
      </Center>
      <Box overflow="hidden" w="100%" mb="3">
        <Tabs isFitted variant="unstyled">
          <TabList>
            <Tab
              _focus={{ outline: "none" }}
              fontWeight="bold"
              _selected={{
                color: "poldit.100",
                borderBottom: "2px solid",
              }}
              fontSize={["sm", "sm", "md"]}
            >
              Followers
              <Badge
                bgColor="green.300"
                variant="solid"
                borderRadius={"md"}
                fontSize="0.78em"
                color={"white"}
                ml="3"
                pl="2"
                pr="2"
              >
                {followerData &&
                  followerData.length > 0 &&
                  numCountDisplay(followerData.length)}
              </Badge>
            </Tab>
            <Tab
              _focus={{ outline: "none" }}
              fontWeight="bold"
              _selected={{
                color: "poldit.100",
                borderBottom: "2px solid",
              }}
              fontSize={["sm", "sm", "md"]}
            >
              All Users
              <Badge
                bgColor="green.300"
                variant="solid"
                borderRadius={"md"}
                fontSize="0.78em"
                color={"white"}
                ml="3"
                pl="2"
                pr="2"
              >
                {data?.getFollowActivity.length > 0 &&
                  numCountDisplay(data?.getFollowActivity.length)}
              </Badge>
            </Tab>
          </TabList>
          <TabPanels mt="2">
            <TabPanel p="0">
              <Scrollbars
                style={{
                  minHeight: "200px",
                  maxHeight: "400px",
                  paddingRight: "8px",
                }}
              >
                {followerData &&
                  followerData.map((item: Follower) => (
                    <FollowerCard key={item._id} data={item} />
                  ))}
              </Scrollbars>
            </TabPanel>
            <TabPanel p="0">
              <Scrollbars
                style={{
                  minHeight: "200px",
                  maxHeight: "400px",
                  paddingRight: "8px",
                }}
              >
                {data?.getFollowActivity.map((item: Follower) => (
                  <FollowerCard key={item._id} data={item} />
                ))}
              </Scrollbars>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
    // <Box>
    //   <Flex
    //     wrap="wrap"
    //     gridGap="2"
    //     justify="center"
    //     align="center"
    //     direction={{ base: "row", lg: "column" }}
    //   >
    //     <Box>
    //       <Box
    //         w="100%"
    //         minW="260px"
    //         cursor="pointer"
    //         bg="white"
    //         color="gray.600"
    //         borderRadius="md"
    //         boxShadow="md"
    //         _checked={{
    //           color: "white",
    //           bg: "gray.500",
    //           borderColor: "gray.500",
    //         }}
    //         _focus={{
    //           outline: "none",
    //         }}
    //         // px={2}
    //         // py={1}
    //       >
    //         <Box>
    //           <Text fontSize="sm" fontWeight="semibold" textAlign="center">
    //             Follower Window
    //           </Text>
    //           {/* <Box position={"absolute"} top="-1" right="1.5">
    //             <InfoBtn
    //               msgTxt="See which polls the users you're following are in!"
    //               size="18px"
    //               placement="top"
    //             />
    //           </Box> */}
    //         </Box>

    //         <Box>
    //           {data?.getFollowActivity.map((item: Follower) => (
    //             <FollowerCard key={item._id} data={item} />
    //           ))}
    //         </Box>
    //       </Box>
    //     </Box>
    //   </Flex>
    // </Box>
  );
};

export default FollowerWindow;

const FollowerCard = ({ data }: { data: Follower }) => {
  const pollTxt = richTxt_toTxt(data.pollQuestion);

  return (
    <Box p="2" w="100%" mb="2" rounded="md" bg="gray.200">
      <HStack spacing={"4"}>
        <Link href={`/Profile/${data?.appId}`}>
          <Box position={"relative"}>
            <Tooltip
              label={data?.appId}
              hasArrow
              placement="left-start"
              rounded={"md"}
            >
              <Avatar
                name={`${data.firstname} ${data.lastname}`}
                size={"sm"}
                src={data?.profilePic}
                border="none"
                cursor="pointer"
                bg="gray.500"
                color="white"
              />
            </Tooltip>
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
        </Link>
        <Box>
          <Link href={data?.pageLoc as string}>
            <Text
              fontSize={"sm"}
              color={"gray.500"}
              _hover={{ color: "blue.500" }}
              cursor="pointer"
              noOfLines={2}
            >
              {showAbbreviatedTxt(pollTxt, 70)}
              {/* {showAbbreviatedTxt(data.pollQuestion, 70)} */}
            </Text>
          </Link>
        </Box>
      </HStack>
    </Box>
  );
};
