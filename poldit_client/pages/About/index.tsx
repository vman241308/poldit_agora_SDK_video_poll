import Layout from "_components/layout/Layout";
import {
  Box,
  Text,
  Stack,
  Center,
  Heading,
  Container,
} from "@chakra-ui/layout";
import { PolditPillars, PolditStack } from "_components/pageComponents/AboutUs";
import CurrentFeatures from "_components/pageComponents/AboutUs/currentFeatures";
import UpcomingFeatures from "_components/pageComponents/AboutUs/upcomingFeatures";
import Metadata from "_components/pageComponents/Other/Metadata";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const AboutUs = () => {
  const [isMobile, setIsMobile] = useState(false);

  const handleMobile = (windowWidth: number) => {
    if (windowWidth <= 1000) {
      setIsMobile(true);
      return;
    }

    setIsMobile(false);
  };

  const getWindowDimensions = () => {
    if (typeof window !== "undefined") {
      const browserWidth = window.innerWidth;

      handleMobile(browserWidth);
    }
  };

  useEffect(() => {
    handleMobile(window.innerWidth);

    window.addEventListener("resize", getWindowDimensions);

    return () => window.removeEventListener("resize", getWindowDimensions);
  }, []);

  if (isMobile) {
    return (
      <Layout>
        <Metadata title="About Poldit" />
        {/* <Container maxW={"6xl"}> */}
        <Stack pb="6">
          <Center>
            <WhoWeAre />
          </Center>
          <Center mt="10">
            <PolditStack />
          </Center>
          <Center>
            <OurStory />
          </Center>
          <Center>
            <ContentTabs />
          </Center>
        </Stack>
        {/* </Container> */}
      </Layout>
    );
  }

  return (
    <Layout>
      <Metadata title="About Poldit" />
      <Container maxW={"6xl"}>
        <Stack pb="6">
          <Center>
            <WhoWeAre />
          </Center>
          <Center mt="10">
            <PolditPillars />
          </Center>
          <Center>
            <OurStory />
          </Center>
          <Center>
            <ContentTabs />
          </Center>
        </Stack>
      </Container>
    </Layout>
  );
};

export default AboutUs;

const WhoWeAre = () => (
  <Box
    mt="4"
    bg="white"
    rounded={"md"}
    p="5"
    boxShadow="0 1px 10px -1px rgba(0,0,0,.2)"
  >
    <Stack spacing={"7"} color="gray.400">
      <Heading color="poldit.100" size="lg" textAlign={"center"}>
        ABOUT POLDIT
      </Heading>
      <Stack
        fontSize={{ base: "xs", sm: "sm", md: "md", lg: "md" }}
        mt="5"
        spacing="2"
      >
        <Text fontWeight={"semibold"}>
          Poldit is a platform for sharing information and connecting audiences.
          You can find information on a variety of topics through our
          interactive text or livestream polls, all in one place!
        </Text>
        <Text>
          Currently, you can ask questions, get answers from our AI and the
          community, chat, and vote or react to content. Our initial focus was
          parenting, and we recently started expanding to other topics.
        </Text>
        <Box>
          <Text fontWeight={"semibold"}>
            COMING SOON: Interactive live streams and mobile app
          </Text>
          <Text mt="1" mb="2">
            Webinars, events, and virtual educational sessions are fantastic
            ways to share information, connect with people, and establish
            yourself as an expert in your field, but that information is
            scattered once they’re over. In Poldit, live streams are created and
            housed it in one place so users and you can easily find them, expand
            your reach, and monetize at the same time.
          </Text>
          Initial features of our live streams for users and businesses will
          include:
          <ul style={{ marginLeft: "50px", marginTop: "2px" }}>
            <li>Creating, viewing, and engaging with multiuser live streams</li>
            <li>Asking/answering questions and polls</li>
            <li>Chat</li>
            <li>Multiuser screenshare</li>
            <li>Viewing all recordings on the platform</li>
          </ul>
        </Box>
      </Stack>
    </Stack>
  </Box>
);

const OurStory = () => (
  <Box
    mt="4"
    bg="white"
    rounded={"md"}
    p="5"
    boxShadow="0 1px 10px -1px rgba(0,0,0,.2)"
  >
    <Stack spacing={"7"} color="gray.400">
      <Heading color="poldit.100" size="lg" textAlign={"center"}>
        OUR STORY
      </Heading>
      <Text
        color="gray.400"
        mt="5"
        fontSize={{ base: "xs", sm: "sm", md: "md", lg: "md" }}
      >
        The idea for Poldit came when Lauren and Ray were expecting their baby
        boy. Trying to figure out what was entailed to be a parent, Lauren spent
        countless hours looking through various sites, apps, and blogs, and
        wanted a better resource. . Ray went through the same thing, piecing
        together information from different places while learning to code. They
        felt most confident when seeing both experts and everyday people agree,
        and thought it would be great to put these two together into one easy to
        use resource along with chat for deeper discussion and clarification.
        They thought, if this is something they wanted then others probably do
        too, so Poldit was born! <br />
        <br />
        For the integrity of the site, it was important to them to encourage
        people to give good answers and want to help others. They decided to
        incentivize people who give quality information and provide value
        through rewards once the site gets revenue. To promote education and
        create a true community with genuine people because there’s no incentive
        for BS. Their vision is to expand this community globally and be the
        singular resource for getting answers to your questions.
      </Text>
    </Stack>
  </Box>
);

const ContentTabs = () => (
  <Tabs
    mt="4"
    bg="white"
    rounded={"md"}
    p="5"
    w="100%"
    boxShadow="0 1px 10px -1px rgba(0,0,0,.2)"
    isFitted
    h="100%"
  >
    <Heading color="poldit.100" size={"lg"} textAlign={"center"} mb="2">
      FEATURES
    </Heading>
    <TabList>
      <Tab
        _focus={{ outline: "none" }}
        fontWeight="semibold"
        _selected={{
          color: "poldit.100",
          borderBottom: "2px solid",
        }}
        fontSize={["md", "md", "lg", "xl"]}
      >
        Current
      </Tab>
      <Tab
        _focus={{ outline: "none" }}
        fontWeight="semibold"
        _selected={{
          color: "poldit.100",
          borderBottom: "2px solid",
        }}
        fontSize={["md", "md", "lg", "xl"]}
      >
        Upcoming
      </Tab>
    </TabList>

    <TabPanels>
      <TabPanel>
        <CurrentFeatures />
      </TabPanel>
      <TabPanel>
        <UpcomingFeatures />
      </TabPanel>
    </TabPanels>
  </Tabs>
);
