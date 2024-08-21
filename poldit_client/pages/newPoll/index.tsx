import { Box, Container, Flex, Text } from "@chakra-ui/react";
import Layout from "_components/layout/Layout";
import CreateNewPoll from "_components/pageComponents/CreatePollPage/CreateNewPoll";
import { NewPollHelp } from "_components/pageComponents/CreatePollPage/NewPollHelp";
import Metadata from "_components/pageComponents/Other/Metadata";
import Head from "next/head";

const NewPoll: React.FC<{}> = () => {
  return (
    <Layout>
      {/* <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head> */}
      <Metadata title="Create New Poll" />
      <Box my="50px">
        <Container maxW="container.xl" aria-label="container">
          <Flex wrap="wrap-reverse" pt="12">
            <Box
              flex={{ base: "0 0 100%", lg: "0 0 70%" }}
              maxW={{ base: "100%", lg: "70%" }}
              justifyContent="center"
            >
              <CreateNewPoll />
            </Box>
            <Box
              flex={{ base: "0 0 100%", lg: "0 0 30%" }}
              maxW={{ base: "100%", lg: "30%" }}
              justifyContent="center"
            >
              <NewPollHelp />
            </Box>
          </Flex>
        </Container>
      </Box>
    </Layout>
  );
};

export default NewPoll;
