import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { Answer, ChatMessage } from "_components/appTypes/appType";
import {
  HandleReference,
  ReportAnswer,
} from "_components/pageComponents/Poll/AnsBox";
import { Poll_Question_Settings } from "./Question";

//   interface Poll_Chat_Settings {
//     loggedIn: boolean;
//     openEditor: () => void;
//     reportItem: ReportAnswer;
//     styles: any;
//     openRemoveModal: () => void;
//     handleReference: HandleReference;
//     answer: Answer;
//   }
interface Poll_Chat_Settings {
  mssg: ChatMessage;
  reply: (refType: string, msg: ChatMessage) => void;
  isMe: boolean;
  loggedIn: boolean;
  report: (contentId: string, contentType: string, creator: string) => void;
  iconColor?: string;
  txtColor?: string;
  btnStyles?: any;
}

const PollChatSettings = ({
  mssg,
  reply,
  isMe,
  loggedIn,
  report,
  iconColor,
  txtColor,
  btnStyles,
}: Poll_Chat_Settings) => {
  return (
    <Box>
      <Menu>
        <MenuButton
          {...btnStyles}
          as={IconButton}
          aria-label="dotMenu"
          icon={
            <BiDotsVerticalRounded size="20px" color={iconColor ?? undefined} />
          }
          variant="ghost"
          _focus={{ outline: "none" }}
          _hover={{ bg: "none" }}
          _active={{ bg: "none" }}
          size="xs"
          color="gray.500"
          disabled={!loggedIn}
        />
        <MenuList minW="-moz-fit-content" color={txtColor ?? undefined}>
          <MenuItem
            _focus={{ outline: "none" }}
            _hover={{ bg: "gray.200" }}
            onClick={() => reply("chat", mssg)}
          >
            Reply
          </MenuItem>

          {!isMe && (
            <MenuItem
              _focus={{ outline: "none" }}
              _hover={{ bg: "gray.200" }}
              onClick={() => report(mssg._id, "Chat", mssg.creator._id)}
            >
              Report
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default PollChatSettings;
