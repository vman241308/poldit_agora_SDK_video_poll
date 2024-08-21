import {
  Flex,
  Box,
  Text,
  Spinner,
  InputGroup,
  Input,
  Button,
  Center,
  Stack,
} from "@chakra-ui/react";
import Scrollbars from "react-custom-scrollbars-2";
import { BiErrorCircle } from "react-icons/bi";
import { RiSendPlaneFill } from "react-icons/ri";
import { ChatMessage, User } from "_components/appTypes/appType";
import { AppContextInterface } from "_components/authProvider/authType";
import {
  ChatTabProps,
  OtherUserCard,
  ReplyMssgBox,
  UserMssgWithReply,
} from ".";
import { StaticCardContent } from "../AnsBox";
import { ChatFooter, VideoChatMssg } from "./chatvideoComps";
import UserRefBox from "./UserRefWindow";

export interface VideoViewProps extends ChatTabProps {
  scrollRef: any;
  onScrollHandler: any;
  userId: any;
  handleScrollLock: (val: boolean) => void;
  isUserRefOpen: boolean;
  chatUsers: User[];
  chatUsersLoading: boolean;
  tagUserHandler: (appid: string) => void;
  auth: AppContextInterface | null;
  userAnswer: string;
  chatInputHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (e: any, isAnswer?: boolean) => Promise<void>;
}

const VideoView = (props: VideoViewProps) => {
  const getChatBoxHeight = () => {
    let chatHeight = "92%";
    if (props.chatRef) {
      chatHeight = "81%";
    }

    if (props.answerRef) {
      chatHeight = "75%";
    }

    return chatHeight;
  };

  return (
    <Box color="white" h="100%" fontSize={"sm"}>
      <Flex
        flexDir="column"
        justifyContent={"space-between"}
        alignItems="center"
        h="100%"
      >
        <Box flex="1" w="100%">
          <Scrollbars
            style={{
              height: "98%",
              marginTop: "5px",
              transition: "height .4s",
              overflowX: "hidden",
              color: "white",
            }}
            renderThumbVertical={({ style, ...props }) => {
              return (
                <div
                  style={{
                    ...style,
                    backgroundColor: "#A0AEC0",
                    borderRadius: "18px",
                  }}
                  {...props}
                />
              );
            }}
            ref={props.scrollRef as any}
            onScroll={props.onScrollHandler}
          >
            <Box h="100%">
              {props.error ? (
                <Flex
                  justify="center"
                  direction="column"
                  align="center"
                  h="100%"
                >
                  <BiErrorCircle color="#718096" size="26px" />
                  <Text color="gray.500" mt="2" fontSize="sm">
                    Error! Cannot load Chat.
                  </Text>
                </Flex>
              ) : (
                <>
                  {props.loading ? (
                    <Flex justify="center" align="center" h="100%">
                      <Spinner size="lg" color="poldit.100" />
                    </Flex>
                  ) : (
                    <>
                      {!props.data?.messages?.length ? (
                        <Flex justify="center" align="center" h="100%">
                          <Text color="gray.500" mt="2" fontSize="sm">
                            Start the conversation!
                          </Text>
                        </Flex>
                      ) : (
                        <Stack pr="4" pl="2" spacing="4">
                          {props.data?.messages.map((d: ChatMessage) => (
                            <VideoChatMssg
                              key={d._id}
                              data={d}
                              handleRef={props.handleRef}
                              report={props.report}
                              userId={props.userId}
                              handleScroll={props.handleScrollLock}
                              user={props.user}
                            />
                          ))}
                        </Stack>
                      )}
                    </>
                  )}
                </>
              )}
            </Box>
          </Scrollbars>
        </Box>
        <Box w="100%" mb="1">
          <ChatFooter
            chatRef={props.chatRef}
            handleRef={props.handleRef}
            answerRef={props.answerRef}
            isUserRefOpen={props.isUserRefOpen}
            chatUsers={props.chatUsers}
            chatUsersLoading={props.chatUsersLoading}
            tagUserHandler={props.tagUserHandler}
            userAnswer={props.userAnswer}
            auth={props.auth}
            onSend={props.onSend}
            chatInputHandler={props.chatInputHandler}
          />
        </Box>
      </Flex>
    </Box>
  );

  // return (
  //   <Box
  //     color="white"
  //     // h="90%"
  //     h={getChatBoxHeight()}
  //     fontSize={"sm"}
  //     transition="height .4s"
  //   >
  //     <Scrollbars
  //       style={{
  //         height: "98%",
  //         marginTop: "15px",
  //         transition: "height .4s",
  //         overflowX: "hidden",
  //         color: "white",
  //       }}
  //       ref={props.scrollRef as any}
  //       onScroll={props.onScrollHandler}
  //     >
  //       <Box h="100%">
  //         {props.error ? (
  //           <Flex justify="center" direction="column" align="center" h="100%">
  //             <BiErrorCircle color="#718096" size="26px" />
  //             <Text color="gray.500" mt="2" fontSize="sm">
  //               Error! Cannot load Chat.
  //             </Text>
  //           </Flex>
  //         ) : (
  //           <>
  //             {props.loading ? (
  //               <Flex justify="center" align="center" h="100%">
  //                 <Spinner size="lg" color="poldit.100" />
  //               </Flex>
  //             ) : (
  //               <>
  //                 {!props.data?.messages?.length ? (
  //                   <Flex justify="center" align="center" h="100%">
  //                     <Text color="gray.500" mt="2" fontSize="sm">
  //                       Start the conversation!
  //                     </Text>
  //                   </Flex>
  //                 ) : (
  //                   <Stack pr="4" pl="2" spacing="4">
  //                     {props.data?.messages.map((d: ChatMessage) => (
  //                       <VideoChatMssg
  //                         key={d._id}
  //                         data={d}
  //                         handleRef={props.handleRef}
  //                         report={props.report}
  //                         userId={props.userId}
  //                         handleScroll={props.handleScrollLock}
  //                         user={props.user}
  //                       />
  //                     ))}
  //                   </Stack>
  //                 )}
  //               </>
  //             )}
  //           </>
  //         )}
  //       </Box>
  //     </Scrollbars>
  //     <ChatFooter
  //       chatRef={props.chatRef}
  //       handleRef={props.handleRef}
  //       answerRef={props.answerRef}
  //       isUserRefOpen={props.isUserRefOpen}
  //       chatUsers={props.chatUsers}
  //       chatUsersLoading={props.chatUsersLoading}
  //       tagUserHandler={props.tagUserHandler}
  //       userAnswer={props.userAnswer}
  //       auth={props.auth}
  //       onSend={props.onSend}
  //       chatInputHandler={props.chatInputHandler}
  //     />
  //   </Box>
  // );
};

export default VideoView;
