import {
  Badge,
  Box,
  Circle,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Tag,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { RiUser3Line } from "react-icons/ri";
import { numCountDisplay } from "_components/formFuncs/miscFuncs";
import { IUserPresence } from "_components/hooks/channel/useChannel";
import { CircleBadge } from "_components/pageComponents/Other/Badges";
import UsersCard from "../UsersCard";
import { INavControlProps } from "./NavControls";

interface IUserWindow extends INavControlProps {
  btnStyles: any;
  roomUsers: IUserPresence[];
}

const UserWindow = (props: IUserWindow) => {
  const notifyMod = props.roomUsers.filter((x) => x.requestInvite).length ?? [];

  return (
    <Box position="relative">
      <Popover placement="top">
        <PopoverTrigger>
          <IconButton
            {...props.btnStyles}
            aria-label={"usersBtn"}
            icon={<RiUser3Line />}
          />
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            border="1px solid white"
            overflow={"hidden"}
            w="300px"
            _focus={{ outline: "none" }}
          >
            <PopoverArrow bg="gray.700" />
            <PopoverBody bg="gray.700" p="0">
              <UsersCard
                data={props.roomUsers}
                handlePanel={props.msgChannel.handlePanel}
                isCreator={props.isCreator}
                mssgs={props.channelMssgs}
                startPoll={props.msgChannel.startPoll}
              />
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
      {props.isCreator && notifyMod > 0 && (
        <Tooltip label={"Panel Requests"} hasArrow placement="top">
          <Circle
            position="absolute"
            bg="#39FF14"
            bottom="1"
            right="1"
            size="12px"
          />
        </Tooltip>
      )}
      {/* {props.users.length > 0 && (
        <Box position={"absolute"} top="-2" right="-3">
          <CircleBadge
            ctrStyles={{
              backgroundColor: "red",
              color: "white",
              fontSize: "5px",
            }}
          >
            {numCountDisplay(56000)}
          </CircleBadge>
        </Box>
        // <Badge
        //   bg={"red"}
        //   position={"absolute"}
        //   bottom="-1"
        //   right="-1"
        //   rounded="lg"
        // >
        //   <Text
        //     textAlign={"center"}
        //     fontWeight={"semibold"}
        //     color="white"
        //     fontSize={"xs"}
        //   >
        //     {numCountDisplay(props.users.length)}
        //   </Text>
        // </Badge>

        // <Tag
        //   size={"sm"}
        //   position={"absolute"}
        //   bottom="-1"
        //   fontSize={"xs"}
        //   bg="red"
        //   variant={"solid"}
        //   fontWeight={"semibold"}
        //   right="-1"
        //   color="white"
        // >
        //   <Text textAlign={"center"}>
        //     {numCountDisplay(props.users.length)}
        //   </Text>
        // </Tag>
      )} */}
    </Box>
  );
};

export default UserWindow;
