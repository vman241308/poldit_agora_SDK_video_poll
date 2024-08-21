import {
  Flex,
  HStack,
  Text,
  Box,
  Tabs,
  TabList,
  Tab,
  Badge,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { numCountDisplay } from "_components/formFuncs/miscFuncs";
import AnsBox from "./AnsBox";
import dynamic from "next/dynamic";
import UserTab from "./UserTab";
import { PollFeedBack } from "_components/appTypes/appType";

const ChatTab = dynamic(() => import("./ChatBox"), {
  ssr: false,
});

const Mobile_View = (props: PollFeedBack) => {
  const boxProps = {
    bg: "white",
    w: "100%",
    boxShadow: "0 1px 10px -1px rgba(0,0,0,.2)",
    borderRadius: "lg",
  };

  const getAnswerCount = () => {
    let answerCount;
    if (
      props.answers.length === 1 &&
      props.answers[0].multichoice &&
      props.answers[0].multichoice?.length > 0
    ) {
      answerCount = props.answers[0].multichoice?.length;
    } else {
      answerCount = props.answers.length;
    }
    return numCountDisplay(answerCount) ?? "";
  };

  return (
    <Box {...boxProps} mr="8" mt="6">
      <Tabs isFitted isLazy>
        <TabList>
          <Tab
            _focus={{ outline: "none" }}
            fontWeight="bold"
            _selected={{
              color: "poldit.100",
              borderBottom: "2px solid",
            }}
            fontSize={"sm"}
          >
            <HStack>
              <Box>Answers</Box>
              <Badge
                bgColor="green.300"
                variant="solid"
                // borderRadius={"md"}
                fontSize="0.78em"
                color={"white"}
              >
                {props.answers && props.answers.length > 0 && getAnswerCount()}
              </Badge>
            </HStack>
          </Tab>
          <Tab
            _focus={{ outline: "none" }}
            fontWeight="bold"
            _selected={{
              color: "poldit.100",
              borderBottom: "2px solid",
            }}
            fontSize={"sm"}
          >
            <HStack>
              <Box>Discussion</Box>
              <Badge
                bgColor="green.300"
                variant="solid"
                // borderRadius={"md"}
                fontSize="0.78em"
                color={"white"}
              >
                {props.chatData?.totalMssgs &&
                  numCountDisplay(props.chatData?.totalMssgs)}
              </Badge>
            </HStack>
          </Tab>
          <Tab
            _focus={{ outline: "none" }}
            fontWeight="bold"
            _selected={{
              color: "poldit.100",
              borderBottom: "2px solid",
            }}
            fontSize={"sm"}
          >
            <HStack>
              <Box>Users Chatting</Box>
              <Badge
                bgColor="green.300"
                variant="solid"
                // borderRadius={"md"}
                fontSize="0.78em"
                color={"white"}
              >
                {props.userList.length > 0 &&
                  numCountDisplay(props.userList.length)}
              </Badge>
            </HStack>
          </Tab>
        </TabList>
        <TabPanels h="750px">
          <TabPanel p="0">
            <AnsBox
              answers={props.answers}
              answersLeft={props.answersLeft}
              handleRef={props.handleRef}
              loading={props.loading}
              addAnswer={props.addAnswer}
              pollId={props.pollId}
              pollType={props.pollType}
              error={props.error}
              report={props.report}
              submitLoading={props.submitLoading}
              isMobile={props.isMobile}
            />
          </TabPanel>
          <TabPanel p="1px" h="750px" w="100%">
            <ChatTab
              pollId={props.pollId}
              user={props.user}
              addAnswer={props.addAnswer}
              answerRef={props.answerRef}
              chatRef={props.chatRef}
              handleRef={props.handleRef}
              report={props.report}
              data={props.chatData}
              loading={props.chatLoading}
              error={props.chatErr}
              subscribeToMore={props.chatSubscribeToMore}
              fetchMore={props.chatFetchMore}
            />
          </TabPanel>
          <TabPanel bg="white" p="1px" h="100%">
            {props.user?._id ? (
              <UserTab
                data={props.userList}
                loading={props.userListloading}
                error={props.userListErr}
                appUser={props.user._id}
                pollId={props.pollId}
              />
            ) : (
              <Flex justify="center" align="center" h="100%">
                <Text color="gray.500" mt="2" fontSize="sm">
                  Please log in to see the users interacting with this poll!
                </Text>
              </Flex>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Mobile_View;
