// interface AuthState {
//   token?: string;
//   userId?: string;
//   userData?: String;
// }

import { InternalUserDataProps } from "_components/appTypes/appType";

export interface AppContextInterface {
  authState: UserDataProps;
  appMssgs: AppMssg[];
  searchVal: string;
  isLoggedIn: boolean;
  isMobile: boolean;
  handleLoggedInStatus: (loggedInVal: boolean) => void;
  setAuthToken: (token: string) => void;
  checkSessionToken: () => boolean;
  updateAppMssgs: (msgList: AppMssg[]) => void;
  handleSearch: (val: string) => string | void;
  updateUserData: (data: UserDataProps) => void;
  signOut: () => void;
  handleMobile: (windowWidth: number) => void;
}
