import { Box, useDisclosure, useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import {
  ApolloError,
  LazyQueryResult,
  OperationVariables,
  QueryLazyOptions,
  useLazyQuery,
  useMutation,
} from "@apollo/client";
import { CustomBtn, PollHistory } from "_components/appTypes/appType";
import { useAuth } from "_components/authProvider/authProvider";
import Layout from "_components/layout/Layout";
import Metadata from "_components/pageComponents/Other/Metadata";
import GraphResolvers from "../lib/apollo/apiGraphStrings";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import getGeoLocation from "_components/apis/geoLocate";
import HomePageView from "_components/pageComponents/Home/views";
import _ from "lodash";
import { AiOutlineHistory } from "react-icons/ai";
import { FiTrendingUp } from "react-icons/fi";
import { BsStars } from "react-icons/bs";
import { IconType } from "react-icons/lib";
import { clearStoredSearch } from "_components/globalFuncs";
import { ComponentError } from "_components/pageComponents/Error/compError";
import NewUserModal from "_components/pageComponents/Home/NewUserModal";
import { GetServerSideProps } from "next";

const {
  NEWEST_POLLS_WITH_PAGINATION,
  TRENDING_POLLS_WITH_PAGINATION,
  RECENT_ACTIVITY_POLLS_WITH_PAGINATION,
} = GraphResolvers.queries;

export interface HomeBtn extends CustomBtn {
  btnName: string;
  active: boolean;
  topic: string;
  currentOffset: number;
  hasMoreItems: boolean;
  Icon: IconType;
  loading: boolean;
  fetch: GraphLazyQuery | undefined;
  err: ApolloError | undefined;
}

export type GraphLazyQuery = (
  options?: QueryLazyOptions<OperationVariables> | undefined
) => Promise<LazyQueryResult<any, OperationVariables>>;

export const currentBtns: HomeBtn[] = [
  {
    btnName: "Recent Activity",
    Icon: AiOutlineHistory,
    active: true,
    topic: "",
    currentOffset: 0,
    hasMoreItems: false,
    data: [],
    loading: false,
    fetch: undefined,
    err: undefined,
  },
  // {
  //   btnName: "Trending Polls",
  //   Icon: FiTrendingUp,
  //   active: false,
  //   topic: "",
  //   currentOffset: 0,
  //   hasMoreItems: false,
  //   data: [],
  //   loading: false,
  //   fetch: undefined,
  //   err: undefined,
  // },
  {
    btnName: "Newest Polls",
    Icon: BsStars,
    active: false,
    topic: "",
    currentOffset: 0,
    hasMoreItems: false,
    data: [],
    loading: false,
    fetch: undefined,
    err: undefined,
  },
];

const itemLimit = 7;

const Home = () => {
  //Hooks/////////////////////////////////////////
  const router = useRouter();
  const auth = useAuth();
  const toast = useToast();
  // const [isMobile] = useMediaQuery("(max-width: 1000px)");

  //States/////////////////////////////////////////
  const [hasMore, setHasMore] = useState(true);
  const [newUser, setNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [btns, setBtns] = useState(currentBtns);
  const [dataErr, setDataErr] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [topic, setTopic] = useState("");
  const [initialLoading, setInitialLoading] = useState(false);
  // const [isMobile, setIsMobile] = useState(false);

  //Queries///////////////////////////////////////
  const [
    getRecentActivity,
    {
      data: recentActivityData,
      error: recentActityError,
      loading: recentActivityLoading,
      fetchMore: recentActivityFetchMore,
    },
  ] = useLazyQuery(RECENT_ACTIVITY_POLLS_WITH_PAGINATION, {
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  // const [
  //   getTrendingPolls,
  //   {
  //     data: trendingPollsData,
  //     error: trendingPollsError,
  //     loading: trendingPollsLoading,
  //     fetchMore: trendingPollsFetchMore,
  //   },
  // ] = useLazyQuery(TRENDING_POLLS_WITH_PAGINATION, {
  //   notifyOnNetworkStatusChange: true,
  //   fetchPolicy: "network-only",
  // });

  const [
    getNewestPolls,
    {
      data: newestPollsData,
      error: newestPollsError,
      loading: newestPollsLoading,
      fetchMore: newPollsFetchMore,
    },
  ] = useLazyQuery(NEWEST_POLLS_WITH_PAGINATION, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
  });

  //Mutations
  const [storeLoc] = useMutation(GraphResolvers.mutations.STORE_USER_LOC);
  const [removeNewUserFlag] = useMutation(
    GraphResolvers.mutations.REMOVE_NEW_USER_FLAG,
    { fetchPolicy: "network-only" }
  );

  //Functions//////////////////////////////////////////

  const updateBtns = (newBtn: HomeBtn) => {
    setBtns((prevBtns) => {
      return prevBtns.map((btn) => {
        if (btn.btnName === newBtn.btnName) {
          return newBtn;
        } else return { ...btn, active: false };
      });
    });
  };

  const fetchMoreData = async (
    btnType: string,
    offset: number,
    topic: string
  ) => {
    switch (btnType) {
      case "Recent Activity":
        const { data: recentActivity } = await recentActivityFetchMore({
          variables: {
            offset,
            limit: itemLimit,
            topic,
          },
        });
        return recentActivity;
      // case "Trending Polls":
      //   const { data: trendingPolls } = await trendingPollsFetchMore({
      //     variables: {
      //       offset,
      //       limit: itemLimit,
      //       topic,
      //     },
      //   });
      //   return trendingPolls;
      case "Newest Polls":
        const { data: newestPolls } = await newPollsFetchMore({
          variables: {
            offset,
            limit: itemLimit,
            topic,
          },
        });
        return newestPolls;
    }
  };

  const loadMore = async () => {
    const activeBtn = btns.find((x) => x.active) as HomeBtn;
    setIsLoading(true);

    if (activeBtn && hasMore) {
      fetchMoreData(
        activeBtn.btnName,
        activeBtn.currentOffset || 0,
        activeBtn.topic
      )
        .then((data) => {
          setIsLoading(false);

          const newData: PollHistory[] = data[Object.keys(data)[0]];
          let p: any = [];
          p.push([...activeBtn.data, ...newData]);
          let arr = p[0];
          let unique = _.uniqBy(arr, function (e: any) {
            return e._id;
          });
          setHasMore(newData.length === itemLimit);
          activeBtn.currentOffset += itemLimit;
          activeBtn.hasMoreItems = newData.length === itemLimit;
          activeBtn.data = unique;
          updateBtns(activeBtn);
        })
        .catch((err) => {
          setDataErr(true);
          setIsLoading(false);
        });
    }
  };

  const getQueryData = (btnName: string) => {
    let btnFn: GraphLazyQuery;
    let btnData: any;
    let btnErr: ApolloError | undefined;
    let btnLoading: boolean;
    switch (btnName) {
      case "Recent Activity":
        btnFn = getRecentActivity;
        btnData = recentActivityData;
        btnErr = recentActityError;
        btnLoading = recentActivityLoading;
        break;
      // case "Trending Polls":
      //   btnFn = getTrendingPolls;
      //   btnData = trendingPollsData;
      //   btnErr = trendingPollsError;
      //   btnLoading = trendingPollsLoading;
      //   break;
      case "Newest Polls":
        btnFn = getNewestPolls;
        btnData = newestPollsData;
        btnErr = newestPollsError;
        btnLoading = newestPollsLoading;
        break;
      default:
        btnFn = getRecentActivity;
        btnData = recentActivityData;
        btnErr = recentActityError;
        btnLoading = recentActivityLoading;
        break;
    }
    return {
      btnFn,
      btnData: btnData ? btnData[Object.keys(btnData)[0]] : [],
      btnErr,
      btnLoading,
    };
  };

  const fetchInitialData = (
    fetch: GraphLazyQuery,
    btn: HomeBtn,
    offset: number,
    topic: string | undefined
  ) => {
    fetch({
      variables: { offset, limit: itemLimit, topic },
    })
      .then(({ data }) => {
        const polls = data[Object.keys(data)[0]];
        btn.currentOffset = itemLimit;
        btn.hasMoreItems = polls.length === itemLimit;
        btn.data = polls;
        btn.active = true;
        btn.topic = topic ?? "";

        updateBtns(btn);
        setInitialLoading(false);
        setHasMore(polls.length === itemLimit);
        setDataErr(false);
      })
      .catch((err) => {
        setDataErr(true);
        setInitialLoading(false);
      });
  };

  const getExistingBtnData = (btnName: string, topic?: string) => {
    !topic && setTopic("");
    setInitialLoading(true);
    const queryProps = getQueryData(btnName);

    const activeBtn = btns.find((x) => x.btnName === btnName) as HomeBtn;

    if (activeBtn) {
      fetchInitialData(queryProps.btnFn, activeBtn, 0, topic);
    }

    updateBtns({ ...activeBtn, active: true });
  };

  const handleTopic = (topic: string) => {
    const activeBtn = btns.find((x) => x.active) as HomeBtn;
    getExistingBtnData(activeBtn.btnName, topic);
    setTopic(topic);
  };

  const closeNewUserModal = () => {
    setNewUser(false);
    removeNewUserFlag();
    onClose();
  };

  //Component Mounted/////////////////////////////////
  useEffect(() => {
    const newUser = auth?.authState?.getUserData?.newUser;

    if (newUser) {
      setNewUser(true);
    }
  }, [auth]);

  useEffect(() => {
    const locCookie = Cookies.get("poldit_uloc");

    (async () => {
      if (!locCookie || locCookie === "N") {
        const userLoc = await getGeoLocation();

        if (userLoc) {
          Cookies.set("poldit_uloc", "Y");
          storeLoc({ variables: { userLoc: JSON.stringify(userLoc) } });
        }
      }
    })();
  }, []);

  useEffect(() => {
    clearStoredSearch();
    auth?.handleSearch("");
  }, []);

  useEffect(() => {
    getExistingBtnData("Recent Activity");
  }, []);

  if (dataErr) {
    return (
      <Layout>
        <Metadata title="Poldit Home" />
        <ComponentError mssg={"Oops! Something went wrong"} fontSize="lg" />
      </Layout>
    );
  }

  return (
    <Layout>
      <Metadata title="Poldit Home" />
      <Box mt="5">
        <NewUserModal
          onOpen={onOpen}
          onClose={closeNewUserModal}
          isOpen={newUser}
          userId={auth?.authState?.getUserData?._id}
          // appId={auth?.authState?.getUserData?.appid}
        />
        <HomePageView
          update={getExistingBtnData}
          hasMore={hasMore && !isLoading}
          loadMore={loadMore}
          btns={btns}
          btnLoading={initialLoading}
          loggedIn={auth?.isLoggedIn as boolean}
          isMobile={auth?.isMobile ?? false}
          handleTopic={handleTopic}
          topic={topic}
        />
      </Box>
    </Layout>
  );
};
export default Home;
