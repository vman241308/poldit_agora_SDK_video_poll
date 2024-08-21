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
  Text,
  Tooltip,
  useDisclosure,
  Avatar,
  Collapse,
} from "@chakra-ui/react";
import Link from "next/link";
import { MdGppGood } from "react-icons/md";
import { IoMdMedal } from "react-icons/io";
import { AiFillStar, AiFillCrown } from "react-icons/ai";
import { MyPollsTab } from "_components/pageComponents/Profile/MyPollsTabs";
import { FollowerModal } from "_components/pageComponents/Profile/FollowerModal";
import { ActivityTab } from "_components/pageComponents/Profile/ActivityTab";
import { FavPollTab } from "_components/pageComponents/Profile/FavPollTab";
import Layout from "_components/layout/Layout";
import { useQuery, useMutation } from "@apollo/client";
import GraphResolvers from "../../lib/apollo/apiGraphStrings";
import { MyAreaOfKnowledge, User } from "_components/appTypes/appType";
import AuthorizedPage from "_components/authProvider/withAuth";
import { RiEdit2Fill } from "react-icons/ri";
import {
  AddArea,
  MyAreasOfKnowledge,
} from "_pageComponents/Profile/areaKnowledge";
import { FollowBtn } from "_components/pageComponents/Other/Button/Follow";
import { useAuth } from "_components/authProvider/authProvider";
import { clearStoredSearch } from "_components/globalFuncs";
import { useEffect, useState } from "react";
import Metadata from "_components/pageComponents/Other/Metadata";
import AreasInterest from "_components/pageComponents/AreaInterest";

const { GET_USER_PROFILE_DATA, MY_AREAS_OF_KNOWLEDGE, GET_APP_USER_FOLLOWERS } =
  GraphResolvers.queries;

const ProfilePage = ({ appid }: { appid: string }) => {
  return (
    <>
      <Metadata title="Poldit Profile" />
      <AuthorizedPage>
        <Profile appid={appid} />
      </AuthorizedPage>
    </>
  );
};

const Profile = ({ appid }: any) => {
  const auth = useAuth();
  const { data: userProfileData } = useQuery(GET_USER_PROFILE_DATA, {
    variables: { appid },
    // fetchPolicy: "network-only",
  });

  const { data: myAreas, loading } = useQuery(MY_AREAS_OF_KNOWLEDGE, {
    variables: { appid },
  });

  // const { data: followerData } = useQuery(GET_APP_USER_FOLLOWERS);

  const [toggleFollow] = useMutation(GraphResolvers.mutations.HANDLE_FOLLOW);

  const handleFollow = (user: User) => {
    toggleFollow({ variables: { details: JSON.stringify(user) } });
    // followHandler(toggleFollow, JSON.stringify(user));
  };

  useEffect(() => {
    clearStoredSearch();
    auth?.handleSearch("");
  }, []);

  return (
    <Layout>
      <Box mt="12" pb="5">
        <Container maxW="container.xl">
          {userProfileData ? (
            <ProfileHeader
              userProfileData={userProfileData?.getUserProfileData}
              handleFollow={handleFollow}
              myAreaData={myAreas?.myAreasOfKnowledge}
              appid={appid}
              // followerData={followerData?.getFollows}
            />
          ) : (
            <Flex justify="center" align="center" minH="300px">
              <Spinner size="lg" color="poldit.100" />
            </Flex>
          )}

          {userProfileData && (
            <Box>
              <Box mt="10">
                <Box>
                  <Tabs isFitted isLazy>
                    <TabList color="gray.400">
                      <Tab
                        _focus={{ outline: "none" }}
                        fontSize={["xs", "sm", "sm", "md"]}
                        _selected={{
                          color: "poldit.100",
                          borderColor: "poldit.100",
                        }}
                      >
                        <Text zIndex="100">My Polls</Text>
                      </Tab>

                      {userProfileData &&
                        userProfileData.getUserProfileData.isMe && (
                          <>
                            <Tab
                              fontSize={["xs", "sm", "sm", "md"]}
                              _focus={{ outline: "none" }}
                              _selected={{
                                color: "poldit.100",
                                borderColor: "poldit.100",
                              }}
                            >
                              <Text zIndex="100">Areas of Interest</Text>
                            </Tab>
                            <Tab
                              fontSize={["xs", "sm", "sm", "md"]}
                              _focus={{ outline: "none" }}
                              _selected={{
                                color: "poldit.100",
                                borderColor: "poldit.100",
                              }}
                            >
                              <Text zIndex="100">Favorites</Text>
                            </Tab>
                          </>
                        )}
                      <Tab
                        fontSize={["sm", "sm", "sm", "md"]}
                        _focus={{ outline: "none" }}
                        _selected={{
                          color: "poldit.100",
                          borderColor: "poldit.100",
                        }}
                      >
                        <Text zIndex="100">Activity</Text>
                      </Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel p="0">
                        <MyPollsTab
                          userId={userProfileData?.getUserProfileData._id}
                        />
                      </TabPanel>
                      {userProfileData &&
                        userProfileData.getUserProfileData.isMe && (
                          <TabPanel p="0">
                            <AreasInterest
                              areas={
                                userProfileData?.getUserProfileData
                                  .areasOfInterest
                              }
                            />
                          </TabPanel>
                        )}
                      {userProfileData &&
                        userProfileData.getUserProfileData.isMe && (
                          <TabPanel p="0">
                            <FavPollTab />
                          </TabPanel>
                        )}
                      <TabPanel p="0">
                        <ActivityTab appId={appid} />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Box>
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </Layout>
  );
};

export default ProfilePage;

interface ProfileHeaderProps {
  userProfileData: User;
  handleFollow: any;
  myAreaData: MyAreaOfKnowledge[];
  appid: string;
  // followerData: Follower[];
}

const ProfileHeader = ({
  userProfileData,
  handleFollow,
  myAreaData,
  appid,
}: // followerData,
ProfileHeaderProps) => {
  const {
    following,
    followers,
    isMe,
    isAppUser,
    pollHistory,
    favorites,
    ...rest
  } = userProfileData;

  const auth = useAuth();
  const appUserId = auth?.authState?.getUserData?._id;

  // const { isOpen, onToggle } = useDisclosure();
  const {
    isOpen: folowerIsOpen,
    onOpen: folowerOnOpen,
    onClose: folowerOnClose,
  } = useDisclosure();
  const {
    isOpen: folowingIsOpen,
    onOpen: folowingOnOpen,
    onClose: folowingOnClose,
  } = useDisclosure();

  const [showBio, setShowBio] = useState<boolean>(false);

  const handleToggle = () => setShowBio(!showBio);

  const badgeStyle = {
    size: "xs",
    "aria-label": "icon-badges",
    color: "gray.600",
    bg: "none",
    _focus: { outline: "none" },
    _hover: { color: "poldit.100" },
  };
  return (
    <Flex
      direction={["column", "row"]}
      justify="center"
      align={["center", "flex-start"]}
    >
      <Box mr={[0, 10]} mb={[4, 0]} position={"relative"}>
        <Avatar
          size="2xl"
          mt="2"
          name={`${userProfileData.firstname} ${userProfileData.lastname}`}
          bg="gray.500"
          color="white"
          src={userProfileData.profilePic}
        />
        {!isMe && userProfileData?.isActive && (
          <Tooltip label="Active" hasArrow placement="right-end">
            <Box
              position="absolute"
              w="20px"
              h="20px"
              borderRadius="50%"
              bg="green.300"
              bottom="4"
              right="3px"
            ></Box>
          </Tooltip>
        )}
      </Box>
      <Flex direction="column">
        <Flex align="center" ml="1">
          <Text fontSize="2xl" fontWeight="bold">
            {userProfileData.appid}
          </Text>
          {userProfileData.isMe ? (
            <Link href="/Profile/edit">
              <Box>
                <Tooltip hasArrow placement="top" label="Edit Profile">
                  <IconButton
                    aria-label="profile-setting"
                    icon={<RiEdit2Fill size="22" />}
                    size="xs"
                    ml="2"
                    mt="1"
                    color="gray.700"
                    bg="none"
                    _focus={{ outline: "none", bg: "none" }}
                    _hover={{ bg: "none" }}
                    _active={{ bg: "none" }}
                  />
                </Tooltip>
              </Box>
            </Link>
          ) : (
            <Box>
              <FollowBtn
                user={userProfileData}
                appUserId={appUserId}
                btnStyle={{
                  iconSize: "20",
                  color: "poldit.100",
                  hoverBg: "poldit.100",
                }}
              />
            </Box>
          )}
        </Flex>
        <Flex gridGap="1" mb="1" ml="0">
          <Tooltip hasArrow placement="top" label="Badges coming soon!">
            <IconButton icon={<MdGppGood size="18" />} {...badgeStyle} />
          </Tooltip>
          <Tooltip hasArrow placement="top" label="Badges coming soon!">
            <IconButton icon={<IoMdMedal size="18" />} {...badgeStyle} />
          </Tooltip>
          <Tooltip hasArrow placement="top" label="Badges coming soon!">
            <IconButton icon={<AiFillCrown size="18" />} {...badgeStyle} />
          </Tooltip>
          <Tooltip hasArrow placement="top" label="Badges coming soon!">
            <IconButton icon={<AiFillStar size="18" />} {...badgeStyle} />
          </Tooltip>
        </Flex>
        <HStack mb="2" ml="1" spacing="3">
          <Box cursor="pointer" onClick={folowerOnOpen}>
            <Text fontSize="sm" _hover={{ color: "blue.400" }}>
              <Text as="span" fontWeight="bold">
                {userProfileData.followers?.length}
              </Text>{" "}
              {(userProfileData?.followers?.length as number) === 1
                ? "Follower"
                : "Followers"}
            </Text>
          </Box>
          <Box cursor="pointer" onClick={folowingOnOpen}>
            <Text fontSize="sm" _hover={{ color: "blue.400" }}>
              <Text as="span" fontWeight="bold">
                {userProfileData?.following?.length || 0}
              </Text>{" "}
              Following
            </Text>
          </Box>
        </HStack>
        <Flex align={"center"}>
          {isMe && <AddArea myAreas={myAreaData} appid={appid} />}
          <MyAreasOfKnowledge data={myAreaData} />
        </Flex>

        <Box ml="1" mt="1" maxW="600px">
          {!showBio && (
            <Box>
              <Text
                fontSize={"sm"}
                color="gray.600"
                cursor="pointer"
                _hover={{ color: "blue.500" }}
                noOfLines={2}
              >
                {userProfileData?.bio}
              </Text>
            </Box>
          )}
          <Collapse in={showBio} animateOpacity>
            <Box fontSize={"sm"} color="gray.600" cursor="pointer">
              {userProfileData?.bio}
            </Box>
          </Collapse>
          {userProfileData.bio && (userProfileData.bio as string).length > 140 && (
            <Text
              onClick={handleToggle}
              fontSize="sm"
              cursor="pointer"
              fontWeight={"semibold"}
              color="blue.500"
              mt="2"
            >
              {showBio ? "Show less" : "Show more"}
            </Text>
          )}
        </Box>
      </Flex>
      <FollowerModal
        isOpen={folowerIsOpen}
        isMe={isMe as boolean}
        onClose={folowerOnClose}
        data={userProfileData.followers}
        followType="follower"
        userId={userProfileData.appid}
      />
      <FollowerModal
        isOpen={folowingIsOpen}
        onClose={folowingOnClose}
        isMe={isMe as boolean}
        data={userProfileData.following}
        followType="following"
        userId={userProfileData.appid}
      />
    </Flex>
  );
};

export async function getServerSideProps(context: any) {
  return {
    props: { appid: context.params.id },
  };
}
