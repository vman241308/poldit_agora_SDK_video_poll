import { useLazyQuery } from "@apollo/client";
import {
  Flex,
  useMediaQuery,
  HStack,
  Input,
  useToast,
  IconButton,
  Box,
} from "@chakra-ui/react";
import Cookies from "js-cookie";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "_components/authProvider/authProvider";
import AboutIcon from "./AboutIcon";
import Logo from "./Logo";
import { NavSearch, NavSearchBtn } from "./SearchBar";
import GraphResolvers from "../../../lib/apollo/apiGraphStrings";
import {
  FollowerBtn,
  MenuItems_LoggedIn,
  MenuItems_LoggedOut,
  MenuSpinner,
  Menu_Dropdown,
  Menu_Dropdown_LoggedOut,
} from "./MenuItems";
import Notifications from "../Notifications/Notifications";
import jwtDecode from "jwt-decode";
import { getAuthId } from "_components/authProvider";
import CustomToast from "../Other/Toast";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { RiHome2Fill } from "react-icons/ri";
import { ImHome3 } from "react-icons/im";
import { getToasts } from "../Other/Toast/toastTypes";

const { LOG_OUT, GET_APPUSER } = GraphResolvers.queries;

const NavBar = (props: any) => {
  const router = useRouter();
  const toast = useToast();
  const cookieUserId: any = getAuthId();
  const { data: session } = useSession();
  const appContext = useAuth();
  const searchVal = appContext ? appContext.searchVal : "";

  const [userLoaded, setUserLoaded] = useState(false);
  const [userId, setUserId] = useState(null);

  //API
  const [getAppUserData, { data: appUserData, loading }] = useLazyQuery(
    GET_APPUSER,
    {
      onError: () => {
        handleLogOut(false);
        getToasts(toast, "error", {
          id: "",
          duration: 3000,
          iconSize: "20px",
          msg: "You have been logged out due to inactivity.  Please log in again.",
          position: "bottom",
          noId: true,
        });
      },
    }
  );
  const [logout, {}] = useLazyQuery(LOG_OUT, { fetchPolicy: "network-only" });

  //Functions
  const goToURL = (url: string) => {
    if (url === "Profile") {
      router.push(`/${url}/${appUserData?.getAppUserData?.appid}`);
      return;
    }

    if (url === "Topics") {
      router.push(
        { pathname: `/${url}`, query: { id: "All_1", tagType: "topic" } },
        `/${url}`
      );
      return;
    }
    router.push(`/${url}`);
  };

  const handleLogOut = async (showToast: boolean = true) => {
    if (session) {
      await signOut({
        redirect: false,
      });
    }
    Cookies.remove("polditSession");
    setUserLoaded(false);
    appContext?.signOut();
    setUserId(null);
    logout();
    appContext?.handleLoggedInStatus(false);

    {
      showToast &&
        toast({
          duration: 2000,
          position: "bottom",
          render: () => (
            <CustomToast
              msg={"You have been successfully logged out!"}
              bg={"green.300"}
              fontColor={"white"}
              iconSize={"20px"}
              Icon={IoCheckmarkCircleOutline}
            />
          ),
        });
    }

    router.push("/");
  };

  //Mounted Hooks
  useEffect(() => {
    const storedVal = localStorage.getItem("PoldIt-data") || "";

    if (!storedVal) {
      return;
    }
    const { searchVal } = JSON.parse(storedVal);
    appContext?.handleSearch(searchVal);
  }, []);

  useEffect(() => {
    const storedVal = localStorage.getItem("PoldIt-data") || "";

    let storedData: object = {};
    if (!storedVal) {
      storedData = { searchVal };
    } else {
      const storedObj = JSON.parse(storedVal as string);
      storedData = { ...storedObj, searchVal };
    }

    localStorage.setItem("PoldIt-data", JSON.stringify(storedData));
  }, [searchVal]);

  useEffect(() => {
    if (cookieUserId) {
      setUserId(cookieUserId);
      return;
    }

    if (!cookieUserId && session) {
      Cookies.set("polditSession", session.accessToken as string, {
        expires: 30,
      });
      const decoded: any = jwtDecode(session.accessToken as string);
      if (decoded?.id) {
        setUserId(decoded?.id);
        return;
      }
    }
  }, [session]);

  useEffect(() => {
    const sessionCookie = Cookies.get("polditSession");

    if (sessionCookie && cookieUserId) {
      setUserLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      try {
        getAppUserData({ variables: { userId: userId } }).catch((err) => {});
      } catch (err) {}
    }
  }, [userId]);

  useEffect(() => {
    if (appUserData) {
      appContext?.updateUserData(appUserData);
      setUserLoaded(true);
      appContext?.handleLoggedInStatus(true);
    }
  }, [appUserData]);

  const getWindowDimensions = () => {
    if (typeof window !== "undefined") {
      const browserWidth = window.innerWidth;

      appContext?.handleMobile(browserWidth);
    }
  };

  useEffect(() => {
    appContext?.handleMobile(window.innerWidth);

    window.addEventListener("resize", getWindowDimensions);

    return () => window.removeEventListener("resize", getWindowDimensions);
  }, []);

  return (
    <Flex
      bg="white"
      minW={{ sm: "50vw" }}
      //   h="60px"
      position={"fixed"}
      w="100%"
      zIndex="999"
      alignItems="center"
      justifyContent={"space-between"}
      boxShadow="0 1px 10px -1px rgba(0,0,0,.2)!important"
      px={[6, 6, 14]}
      py={[2]}
    >
      <Flex align="center">
        <Logo />
        <IconButton
          aria-label={"homebtn"}
          ml="2"
          icon={<ImHome3 />}
          onClick={() => router.push("/")}
          fontSize="30px"
          // boxSize={"40px"}
          position="relative"
          _active={{ bg: "none" }}
          color="gray.600"
          variant="ghost"
          _hover={{ bg: "none" }}
          _focus={{ outline: "none" }}
        />
      </Flex>

      {!appContext?.isMobile && <NavSearch searchVal={searchVal} />}
      {loading && !userLoaded && <MenuSpinner />}
      {!loading && userLoaded && (
        <Flex>
          {appContext?.isMobile ? (
            <HStack spacing={"3"}>
              <NavSearchBtn searchVal={searchVal} />
              {/* <FollowerBtn
                followers={appUserData?.getAppUserData?.following.map(
                  (x: any) => x.appId
                )}
              /> */}
              <Notifications userId={userId} />
              <Menu_Dropdown
                navLink={goToURL}
                logOut={handleLogOut}
                isMobile={appContext.isMobile}
              />
            </HStack>
          ) : (
            <MenuItems_LoggedIn
              userId={userId}
              userData={appUserData}
              navLink={goToURL}
              logOut={handleLogOut}
              followers={appUserData?.getAppUserData?.following.map(
                (x: any) => x.appId
              )}
            />
          )}
        </Flex>
      )}

      {!loading && !userLoaded && (
        <Flex>
          {appContext?.isMobile ? (
            <HStack spacing={"3"}>
              <NavSearchBtn searchVal={searchVal} />
              <Menu_Dropdown_LoggedOut />
            </HStack>
          ) : (
            <MenuItems_LoggedOut />
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default NavBar;
