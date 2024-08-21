import Cookies from "js-cookie";

const checkInterUserCookie = () => {
  const exist = Cookies.get("internalUserPolditSession");
  return !!exist;
};


export default checkInterUserCookie;