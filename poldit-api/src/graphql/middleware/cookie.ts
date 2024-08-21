// import { serialize, parse } from "cookie";
// import { Response } from "express";
// import { ResponseCustom, CookieOptions } from "../../interfaces";
// import { Http2ServerResponse } from "http2";
// // import { CookieOptions } from "../../components/appTypes/appType";
// // import { CookieOptions } from "../../components/appTypes/appType";
// // import { storeTokens } from "../../lib/apollo";

// const cookie = (
//   res: Http2ServerResponse | ResponseCustom,
//   name: string,
//   value: string,
//   options: CookieOptions | any
// ) => {
//   if (options?.maxAge > -1) {
//     options.expires = new Date(Date.now() + options.maxAge);
//   } else options.expires = new Date(0);

//   res.setHeader("Set-Cookie", serialize(name, value, options));
// };

// const withCookies = (handler: any) => (req: Request, res: ResponseCustom) => {
//   res.cookie = (name, value, options) => cookie(res, name, value, options);

//   return handler(req, res);
// };

// export default withCookies;
