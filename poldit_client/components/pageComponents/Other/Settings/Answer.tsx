import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { Answer } from "_components/appTypes/appType";
import {
  HandleReference,
  ReportAnswer,
} from "_components/pageComponents/Poll/AnsBox";
import { Poll_Question_Settings } from "./Question";

interface Poll_Answer_Settings {
  loggedIn: boolean;
  openEditor: () => void;
  reportItem: ReportAnswer;
  styles: any;
  openRemoveModal: () => void;
  handleReference: HandleReference;
  answer: Answer;
}

const PollAnswerSettings = ({
  loggedIn,
  openEditor,
  reportItem,
  styles,
  openRemoveModal,
  handleReference,
  answer,
}: Poll_Answer_Settings) => {
  return (
    <Box {...styles}>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="dotMenu"
          icon={<BiDotsVerticalRounded size="20px" />}
          variant="ghost"
          _focus={{ outline: "none" }}
          _hover={{ bg: "none" }}
          _active={{ bg: "none" }}
          size="xs"
          color="gray.500"
          disabled={!loggedIn}
        />
        <MenuList color="gray.500" fontSize={"sm"}>
          {answer.isEditable && answer.answer.startsWith('[{"type":') && (
            <MenuItem
              _focus={{ outline: "none" }}
              _hover={{ bg: "poldit.100", color: "white" }}
              onClick={openEditor}
            >
              Edit
            </MenuItem>
          )}
          {answer.isRemoveable && (
            <MenuItem
              _focus={{ outline: "none" }}
              _hover={{ bg: "poldit.100", color: "white" }}
              onClick={openRemoveModal}
            >
              Remove
            </MenuItem>
          )}

          <MenuItem
            _focus={{ outline: "none" }}
            _hover={{ bg: "poldit.100", color: "white" }}
            onClick={() => handleReference("answer", answer)}
          >
            Reference answer in chat
          </MenuItem>
          <MenuItem
            _focus={{ outline: "none" }}
            _hover={{ bg: "poldit.100", color: "white" }}
            onClick={() =>
              reportItem(answer._id, "Answer", answer.creator?._id as string)
            }
          >
            Report
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default PollAnswerSettings;
