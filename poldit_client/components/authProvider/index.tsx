import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

export const getAuthId = () => {
  const sessionCookie = Cookies.get("polditSession");

  if (sessionCookie) {
    const decoded: any = jwtDecode(sessionCookie as string);

    return decoded?.id;
  }

  return "";
};
