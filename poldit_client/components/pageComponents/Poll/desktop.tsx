import {
  Flex,
  Text,
  Box,
  Tabs,
  TabList,
  Tab,
  Badge,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { PollFeedBack } from "_components/appTypes/appType";
import { numCountDisplay } from "_components/formFuncs/miscFuncs";
import AppMssg from "../Other/AppMssgs";
import AnsBox from "./AnsBox";
import ChatTab from "./ChatBox";
import UserTab from "./UserTab";

const Desktop_View = (props: PollFeedBack) => {
  const boxProps = {
    bg: "white",
    w: "100%",
    boxShadow: "0 1px 10px -1px rgba(0,0,0,.2)",
    borderRadius: "lg",
  };

  const headerProps = {
    color: "poldit.100",
    p: "2",
    fontSize: "large",
    fontWeight: "semibold",
  };

  return (
    <Flex mt="10" justify={"space-between"}>
      <Box {...boxProps} mr="8">
        <Text {...headerProps} textAlign={"center"}>
          Answers
        </Text>
        <Box overflow={"hidden"}>
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
          />
        </Box>
      </Box>
      <Box {...boxProps}>
        <Text {...headerProps} textAlign={"center"}>
          Discussion
        </Text>
        <Box h="94%">
          <ChatView {...props} />
        </Box>
      </Box>
    </Flex>
  );
};

export default Desktop_View;

const ChatView = (props: PollFeedBack) => {
  return (
    <Tabs isFitted>
      <TabList>
        <Tab
          _focus={{ outline: "none" }}
          fontWeight="bold"
          _selected={{
            color: "poldit.100",
            borderBottom: "2px solid",
          }}
          fontSize={["sm", "sm", "md"]}
        >
          Chat
        </Tab>
        <Tab
          _focus={{ outline: "none" }}
          fontWeight="bold"
          _selected={{
            color: "poldit.100",
            borderBottom: "2px solid",
          }}
          fontSize={["sm", "sm", "md"]}
        >
          Users Chatting
          <Badge
            bgColor="green.300"
            variant="solid"
            borderRadius={"md"}
            fontSize="0.78em"
            color={"white"}
            ml="3"
            pl="2"
            pr="2"
          >
            {props.userList.length > 0 &&
              numCountDisplay(props.userList.length)}
          </Badge>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel bg="white" p="1px" h="750px">
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
              appUser={props.user?._id}
              pollId={props.pollId}
            />
          ) : (
            <Flex justify="center" align="center" h="500px">
              <Text color="gray.500" mt="2" fontSize="sm">
                Please log in to see the users interacting with this poll!
              </Text>
            </Flex>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
