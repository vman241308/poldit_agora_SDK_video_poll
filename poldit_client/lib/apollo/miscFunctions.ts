import { Request, Response } from "express";
import { DocumentNode } from "graphql";
import { Http2ServerRequest, Http2ServerResponse } from "http2";
import { initializeApollo, storeTokens } from "../apollo";
import Cookies from "js-cookie";

export const runGraphQuery = async (
  queryType: string,
  query: DocumentNode,
  req: Request,
  variables = {}
) => {
  let cookie: any = Cookies.get("polditSession");
  const apolloClient = initializeApollo();
  const appCookie = req.headers?.cookie;

  storeTokens("", appCookie);

  let response;

  if (queryType === "mutation") {
    response = await apolloClient.mutate({
      mutation: query,
      variables,
    });
  } else {
    response = await apolloClient.query({
      query,
    });
  }

  return response;
};

// export const redirect = (res, targetRoute) => {
//   if (res) {
//     res.writeHead(303, { Location: targetRoute });
//   } else {
//     Router.replace(targetRoute);
//   }
// };
