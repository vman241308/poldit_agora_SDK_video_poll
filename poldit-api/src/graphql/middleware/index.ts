// import { Request } from "express-serve-static-core";
// import configs from "../../endpoints.config";
// import { serialize, parse } from "cookie";
// import jwt from "jsonwebtoken";

// const { JwtKey, RefreshKey } = configs;

// interface Token {
//   id: string;
// }

// let decodedToken: string | object;

// export const isAuthenticated = (req: Request) => {
//   // console.log(req.headers);
//   const appToken = hasAppToken(req);
//   const appCookie = hasCookie(req);

//   let isAuth: { auth: boolean; id: string | null | undefined };

//   if (appToken.hasValidToken) {
//     isAuth = { auth: true, id: appToken.userId };
//   } else if (!appToken.hasValidToken && appCookie.hasValidCookie) {
//     isAuth = { auth: true, id: appCookie.userId };
//   } else {
//     isAuth = { auth: false, id: null };
//   }

//   return isAuth;
// };

// const hasAppToken = (req: Request) => {
//   let currentToken = req.headers.authorization ? req.headers.authorization : "";
//   currentToken = currentToken.replace("Bearer ", "");

//   let hasValidToken;
//   let userId: string = "";

//   if (!currentToken || currentToken === "") {
//     hasValidToken = false;
//   }

//   try {
//     decodedToken = jwt.verify(currentToken, JwtKey);
//     userId = (decodedToken as Token).id;
//     hasValidToken = true;
//   } catch (err) {
//     hasValidToken = false;
//   }

//   return { hasValidToken, userId };
// };

// const hasCookie = (req: Request) => {
//   const refreshToken = req.headers.cookie;

//   let hasValidCookie: boolean;
//   let userId: string = "";

//   if (!refreshToken || refreshToken === "") {
//     // if (!refreshToken || refreshToken === "" || refreshToken === {}) {
//     return { hasValidCookie: false };
//   }

//   const cookie = parse(refreshToken)["polditSession"];

//   try {
//     decodedToken = jwt.verify(cookie, RefreshKey);
//     userId = (decodedToken as Token).id;

//     hasValidCookie = true;
//   } catch (err) {
//     hasValidCookie = false;
//   }
//   // hasValidCookie = true;

//   return { hasValidCookie, userId };
// };

// // export const refreshAppToken = (req, res) => {
// //   const appCookie = req.headers.cookie;
// //   console.log("refreshToken middleware: ", appCookie);
// // };
