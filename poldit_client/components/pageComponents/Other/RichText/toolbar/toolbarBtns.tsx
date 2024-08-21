import {
  Box,
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Popover,
  PopoverTrigger,
  Tag,
  TagLabel,
  TagLeftIcon,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { EditorState, RichUtils } from "draft-js";
import { useRef, useState } from "react";
import { BiLink } from "react-icons/bi";
import { BsChevronDown, BsEmojiExpressionless } from "react-icons/bs";
import { CgImage } from "react-icons/cg";
import { IconType } from "react-icons/lib";
import { inlineStyles, blockTypes } from "./constants";
import React from "react";
import FileDrop from "../../FileDrop";
import { AddMedia } from ".";
import EmojiPicker from "../../Emojis";
// import { IEmojiData } from "emoji-picker-react";

interface InlineStyleCtr {
  editorState: EditorState;
  updateEditorState: (state: EditorState) => void;
}

export const InlineStyleBtns = ({
  editorState,
  updateEditorState,
}: InlineStyleCtr) => {
  const toggleInlineStyle = (e: Event, style: string) => {
    e.preventDefault();

    updateEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const isActive = (style: string) => {
    const currentStyle = editorState.getCurrentInlineStyle();
    return currentStyle.has(style);
  };

  return (
    <Flex>
      {inlineStyles.map((item, idx) => (
        <ToolBarItem
          key={idx}
          item={item}
          isActive={isActive(item.style)}
          toggleStyle={toggleInlineStyle}
        />
      ))}
    </Flex>
  );
};

interface ToolBarItem {
  item: { label: string; style: string; icon: JSX.Element };
  isActive: boolean;
  toggleStyle: any;
}

export const ToolBarItem = ({ item, isActive, toggleStyle }: ToolBarItem) => {
  return (
    <IconButton
      aria-label={`style_${item.label}`}
      size="sm"
      marginRight="8px"
      bgColor={isActive ? "gray.500" : "gray.100"}
      color={isActive ? "white" : "black"}
      onMouseDown={(e) => toggleStyle(e, item.style)}
    >
      {item.icon || item.label}
    </IconButton>
  );
};

interface LinkBtn {
  link: (state: EditorState) => void;
  editorState: EditorState;
}

export const LinkBtn = ({ link, editorState }: LinkBtn) => {
  return (
    <IconButton
      aria-label={`linkBtn`}
      fontSize="md"
      size="sm"
      marginRight="8px"
      icon={<BiLink />}
      onClick={() => link(editorState)}
    />
  );
};

interface ImgBtn {
  editorState: EditorState;
  addMedia: AddMedia;
}

export const ImgBtn = ({ editorState, addMedia }: ImgBtn) => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const firstFieldRef = useRef(null);

  return (
    <Box>
      <Popover
        isLazy
        isOpen={isOpen}
        initialFocusRef={firstFieldRef}
        onOpen={onOpen}
        onClose={onClose}
        placement="bottom"
        closeOnBlur={false}
      >
        <PopoverTrigger>
          <IconButton
            aria-label={`linkBtn`}
            fontSize="lg"
            size="sm"
            marginRight="8px"
            color={isOpen ? "white" : "gray.800"}
            _active={{ outline: "none" }}
            _focus={{ outline: "none" }}
            icon={<CgImage />}
            bg={isOpen ? "gray.500" : "gray.100"}
          />
        </PopoverTrigger>
        <FileDrop maxFiles={1} close={onClose} addMedia={addMedia} />
      </Popover>
    </Box>
  );
};

interface EmojiBtn {
  editorState: EditorState;
}

export const EmojiBtn = ({ editorState }: EmojiBtn) => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const firstFieldRef = useRef(null);

  return (
    <Box>
      <Popover
        isLazy
        isOpen={isOpen}
        initialFocusRef={firstFieldRef}
        onOpen={onOpen}
        onClose={onClose}
        placement="bottom"
        closeOnBlur={false}
      >
        <PopoverTrigger>
          <IconButton
            aria-label={`linkBtn`}
            fontSize="lg"
            size="sm"
            marginRight="8px"
            color={isOpen ? "white" : "gray.800"}
            _active={{ outline: "none" }}
            _focus={{ outline: "none" }}
            icon={<BsEmojiExpressionless />}
            bg={isOpen ? "gray.500" : "gray.100"}
          />
        </PopoverTrigger>
        {/* <EmojiPicker close={close} /> */}
        {/* <FileDrop maxFiles={1} close={onClose} addMedia={addMedia} /> */}
      </Popover>
    </Box>
  );
};

interface BlockTypes {
  editorState: EditorState;
  updateEditorState: (editorState: EditorState) => void;
}

export const BlockStyleBtns = ({
  editorState,
  updateEditorState,
}: BlockTypes) => {
  const toggleBlockStyle = (e: any, style: string) => {
    e.preventDefault();
    updateEditorState(RichUtils.toggleBlockType(editorState, style));
  };

  return (
    <Box zIndex={200} fontSize="xs">
      <Menu>
        <MenuButton
          height={"32px"}
          as={Button}
          fontSize="xs"
          rightIcon={<BsChevronDown size="10px" />}
          _focus={{ border: "none" }}
        >
          Normal
        </MenuButton>
        <MenuList
          minWidth="40px"
          w="88px"
          boxShadow="0px 0px 3px 1px rgba(15, 15, 15, 0.17)"
          h="200px"
          overflow={"auto"}
        >
          {blockTypes.map((item, idx) => (
            <Box key={idx}>
              <Tooltip
                label={item.label}
                hasArrow
                placement="left"
                fontSize={"xs"}
                p="2"
                rounded="md"
              >
                <MenuItem onMouseDown={(e) => toggleBlockStyle(e, item.style)}>
                  {item.icon || item.label}
                </MenuItem>
              </Tooltip>
            </Box>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};

interface CounterTag {
  Icon: IconType;
  size: string;
  count: number;
  max: number;
}

export const CounterTag = ({ Icon, size, count, max }: CounterTag) => (
  <Tag size={size} key={size} p="2">
    <TagLeftIcon as={Icon} color={count === max ? "red.500" : "gray.600"} />
    <TagLabel color={count === max ? "red.500" : "gray.600"}>{`${count}/${max}`}</TagLabel>
  </Tag>
);
