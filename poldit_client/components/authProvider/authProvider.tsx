import Cookies from "js-cookie";
import { isTokkenValid } from "lib/externalUserAuth";
import { createContext, useContext, useEffect, useState } from "react";
import { storeTokens } from "../../lib/apollo";
import { AppMssg } from "../appTypes/appType";
import { AppContextInterface } from "./authType";

const AuthContext = createContext<AppContextInterface | null>(null);

const AuthProvider = ({ children }: any) => {
  const [authState, setAuthState] = useState(null);
  const [appMssgs, setAppMssgs] = useState<AppMssg[]>([]); //This may not be needed since you can pass mssgs between pages.  Think of removing
  const [searchVal, updateSearchVal] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleSearch = (val: string) => {
    updateSearchVal(val);
  };

  const handleLoggedInStatus = (loggedInVal: boolean) => {
    setIsLoggedIn(loggedInVal);
  };

  const setAuthToken = (token: string) => {
    // const updatedAuthState: any = {
    //   getUserData: { ...authState?.getUserData },
    // };
    // setAuthState(token);
  };

  const updateAppMssgs = (msgList: AppMssg[]) => {
    //This may not be needed since you can pass mssgs between pages.  Think of removing
    setAppMssgs(msgList);
  };

  const handleMobile = (windowWidth: number) => {
    if (windowWidth <= 900) {
      setIsMobile(true);
      return;
    }

    setIsMobile(false);
  };

  const checkSessionToken = () => {
    const sessionCookie = Cookies.get("polditSession");
    return isTokkenValid(sessionCookie ?? "");
  };

  const updateUserData = (userData: any) => {
    const updatedAuthState: any = {
      getUserData: { ...userData?.getAppUserData },
    };
    setAuthState(updatedAuthState);
  };

  const signOut = () => {
    const updatedAuthState: any = {
      getUserData: null,
    };
    setAuthState(updatedAuthState);

    if (typeof window !== "undefined") {
      localStorage.removeItem("poldItUser");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        appMssgs,
        searchVal,
        isLoggedIn,
        isMobile,
        handleLoggedInStatus,
        setAuthToken,
        updateAppMssgs,
        checkSessionToken,
        handleSearch,
        updateUserData,
        signOut,
        handleMobile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider as default, useAuth };
