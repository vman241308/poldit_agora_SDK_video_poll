import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import fetch from "cross-fetch";
import GraphResolvers from "../lib/apollo/apiGraphStrings";

const videoCompostion = (channelName: String, fileList: String) => {
  const client = new ApolloClient({
    link: new HttpLink({ uri: "http://localhost:8080/graphql", fetch }),
    cache: new InMemoryCache(),
  })
    .mutate({
      mutation: GraphResolvers.mutations.START_COMPOSITION_VIDEO,
      variables: {
        channelName: channelName,
        fileList: fileList,
      },
    })
    .then((res) => {
      return res;
    })
    .catch((err) => {
      return err;
    });
};

export default videoCompostion;
