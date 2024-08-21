import { Box, Container, Flex, Text } from "@chakra-ui/react";
import "simplebar/dist/simplebar.min.css";
import React, { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import GraphResolvers from "../../lib/apollo/apiGraphStrings";
import { getStoredSearch } from "../../components/globalFuncs";
import { useRouter } from "next/router";
import Layout from "_components/layout/Layout";
import { VscSearchStop } from "react-icons/vsc";
import DataTabs from "_components/pageComponents/Search";
import Metadata from "_components/pageComponents/Other/Metadata";

const { SEARCH_ALL } = GraphResolvers.queries;

export default function Search() {
  const router = useRouter();

  const storedVal = getStoredSearch();

  //State Management
  const [searchValue, updateSearchValue] = useState(storedVal);
  const [results, setResults] = useState<any>(null);
  //API
  const [searchAll, { loading }] = useLazyQuery(SEARCH_ALL, {
    onCompleted: (res) => setResults(res?.searchAll),
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (router.query.searchVal) {
      updateSearchValue(router.query.searchVal);
    }

    localStorage.setItem(
      "PoldIt-data",
      JSON.stringify({ searchVal: searchValue })
    );

    searchAll({ variables: { searchVal: searchValue } });
  }, [router.query, searchValue, results]);

  const emptyData = () => {
    if (
      !results?.question?.count &&
      !results?.answer?.count &&
      !results?.topic?.count &&
      !results?.subTopic?.count &&
      !results?.user?.count
    ) {
      return true;
    } else return false;
  };

  return (
    <Layout>
      <Metadata title="Search Results" />
      <Box mt="10">
        <Container maxW="container.xl">
          <Box>
            <Flex justify="center">
              <Text
                textTransform="uppercase"
                fontWeight="bold"
                fontSize={["lg", "xl"]}
              >
                search results
              </Text>
            </Flex>
            {emptyData() && !loading ? (
              <NoDataTab />
            ) : (
              <DataTabs loading={loading} data={results} />
            )}
          </Box>
        </Container>
      </Box>
    </Layout>
  );
}

const NoDataTab = () => {
  return (
    <Flex
      justify="center"
      align="center"
      minH="300px"
      color="poldit.100"
      direction="column"
    >
      <VscSearchStop size="52" />
      <Text mt="2">No results found</Text>
    </Flex>
  );
};
