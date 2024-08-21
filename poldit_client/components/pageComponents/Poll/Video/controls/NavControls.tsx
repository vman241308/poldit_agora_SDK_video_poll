import {
  HStack,
  Button,
  IconButton,
  Flex,
  Tooltip,
  Tag,
  Box,
  Text,
  Circle,
} from "@chakra-ui/react";
import { Types } from "ably";
import React, { useState } from "react";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { BsChatDots } from "react-icons/bs";
import { IoHandLeftOutline, IoHandLeftSharp } from "react-icons/io5";
import { RiQuestionnaireLine } from "react-icons/ri";
import { numCountDisplay } from "_components/formFuncs/miscFuncs";
import { getUniqueObjsList } from "_components/globalFuncs";

import {
  IUseMsgChannelReturn,
  IUserPresence,
  TOtherChannelHandler,
  TPublishToChannel,
} from "_components/hooks/channel/useChannel";
import ThreeDotsLoading from "_components/pageComponents/Other/Loading/threeDots";
import AdminWindow from "./AdminWindow";
import PanelVideoControls from "./PanelVideoControls";
import UserWindow from "./UserWindow";

export interface INavControlProps {
  qaOpen: boolean;
  chatOpen: boolean;
  // togglePanel: THandlePanels;
  toggleQa: (props?: any) => any;
  toggleChat: (props?: any) => any;
  msgChannel: IUseMsgChannelReturn;
  // users: IUserPresence[];
  // handlePanel: TOtherChannelHandler;
  // panel: IUserPresence[];
  userId: string;
  //   panelMember: IUserPresence | undefined;
  isCreator: boolean;
  channelMssgs: Types.Message[];
  // updatePanel: TPublishToChannel;
}

function NavControls(props: INavControlProps) {
  const {
    users,
    stream,
    startPoll,
    panelMembers,
    publishToChannel: updatePanel,
  } = props.msgChannel;

  const panelMember = panelMembers.find((x) => x.uid == props.userId);

  const roomUsers = getUniqueObjsList(
    users.map((x) => {
      const panelData = panelMembers.find((p) => p.uid === x.uid);
      if (panelData) {
        return panelData;
      }
      return x;
    }),
    "uid"
  );

  const audienceMember = roomUsers.find((x) => x.uid === props.userId);

  const btnStyles: any = {
    variant: "ghost",
    color: "white",
    size: "sm",
    bg: "gray.700",
    // p: 2,
    fontSize: "20px",
    _hover: { color: "poldit.100", border: "1px" },
    _focus: { outline: "none" },
  };

  return (
    <Flex
      justify={"space-between"}
      pl="5"
      pr="5"
      alignItems={"center"}
      fontSize={"12px"}
    >
      <Box
        p="0.5"
        textAlign="center"
        position="relative"
        onClick={() => props.msgChannel.containerMssgs.closeMssgTrigger("qa")}
      >
        <IconButton
          {...props.toggleQa()}
          {...btnStyles}
          aria-label={"qAndA"}
          color={"white"}
          // onClick={() => props.togglePanel("QA")}
          icon={<AiOutlineQuestionCircle />}
        />
        {props.msgChannel.containerMssgs.newQA && (
          <Circle
            position="absolute"
            bg="#39FF14"
            bottom="6"
            right="1"
            size="12px"
          />
        )}
        <Text>Q&A</Text>
      </Box>
      {/* <Button
        {...props.toggleQa()}
        fontSize={"sm"}
        size="lg"
        variant="ghost"
        bg="gray.700"
        p="2"
        _hover={{ color: "poldit.100", border: "1px" }}
        _focus={{ outline: "none" }}
        // onClick={() => props.togglePanel("QA")}
      >
        Q&A
      </Button> */}

      <HStack
        rounded="md"
        p="0.5"
        // border="1px solid red"
        // fontSize={"12px"}
        textAlign="center"
        spacing="5"
      >
        <Box>
          <UserWindow {...props} btnStyles={btnStyles} roomUsers={roomUsers} />
          <Text>{`${numCountDisplay(roomUsers.length)} ${
            roomUsers.length === 1 ? "User" : "Users"
          }`}</Text>
        </Box>
        {panelMember && props.isCreator && startPoll && (
          <Box>
            <AdminWindow {...props} btnStyles={btnStyles} mod={panelMember} />
            <Text>Controls</Text>
          </Box>
        )}
        {/* {props.isCreator && props.startPoll && (
          <AdminWindow {...props} btnStyles={btnStyles} />
        )} */}
        {startPoll && panelMember && (
          <PanelVideoControls
            btnStyles={btnStyles}
            member={panelMember}
            updatePanel={updatePanel}
            btnStates={stream}
            isHost={props.isCreator}
          />
        )}
        {startPoll && !panelMember && (
          <Box>
            <IconButton
              {...btnStyles}
              aria-label={"panelRequest"}
              color={"white"}
              onClick={() => {
                const audienceMember = roomUsers.find(
                  (x) => x.uid === props.userId
                );
                audienceMember &&
                  updatePanel("User Invite Request", audienceMember);
              }}
              icon={<IoHandLeftSharp />}
            />
            <Text>{`${
              !audienceMember?.requestInvite
                ? "Panel Request"
                : "Pending Invite"
            }`}</Text>
          </Box>
        )}

        {/* {props.startPoll && !panelMember && !audienceMember?.requestInvite && (
          // <Tooltip label={`Request Panel Invite`} hasArrow placement="top">

          <IconButton
            {...btnStyles}
            aria-label={"panelRequest"}
            color={"white"}
            onClick={() => {
              const audienceMember = roomUsers.find(
                (x) => x.uid === props.userId
              );
              audienceMember &&
                props.updatePanel("User Invite Request", audienceMember);
            }}
            icon={<IoHandLeftSharp />}
          />

          // </Tooltip>
        )}
        {props.startPoll && !panelMember && audienceMember?.requestInvite && (
          <Tooltip label={`Pending Invite`} hasArrow placement="top">
            <Box pl="2">
              <ThreeDotsLoading
                btnStyles={{ width: "5px", height: "5px", margin: "1px 2px" }}
              />
            </Box>
          </Tooltip>
        )} */}
      </HStack>

      <Box
        p="0.5"
        textAlign="center"
        position="relative"
        onClick={() =>
          props.msgChannel.containerMssgs.newChat &&
          props.msgChannel.containerMssgs.closeMssgTrigger("chat")
        }
      >
        <IconButton
          {...props.toggleChat()}
          {...btnStyles}
          aria-label={"chatBtn"}
          // onClick={() => props.togglePanel("Chat")}
          icon={<BsChatDots />}
        />
        {props.msgChannel.containerMssgs.newChat && (
          <Circle
            position="absolute"
            bg="#39FF14"
            bottom="6"
            right="1"
            size="12px"
          />
        )}
        <Text>Chat</Text>
      </Box>
    </Flex>
  );
}

export default NavControls;
