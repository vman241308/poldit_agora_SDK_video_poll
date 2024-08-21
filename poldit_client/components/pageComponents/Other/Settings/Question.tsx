import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import { BiDotsVerticalRounded } from "react-icons/bi";
import { ReportPoll } from "_components/pageComponents/Poll/Question";

export interface Poll_Question_Settings {
  isEditable: boolean;
  loggedIn: boolean;
  openEditor: () => void;
  reportItem: ReportPoll;
  pollId: string;
  creatorId: string;
}

const PollQuestionSettings = ({
  isEditable,
  loggedIn,
  openEditor,
  reportItem,
  pollId,
  creatorId,
}: Poll_Question_Settings) => {
  return (
    <Box>
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
        <MenuList>
          {isEditable && (
            <MenuItem
              _focus={{ outline: "none" }}
              _hover={{ bg: "gray.200" }}
              onClick={openEditor}
            >
              Edit
            </MenuItem>
          )}
          <MenuItem
            _focus={{ outline: "none" }}
            _hover={{ bg: "gray.200" }}
            onClick={() => reportItem(pollId, "Poll", creatorId)}
          >
            Report
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};


export default PollQuestionSettings