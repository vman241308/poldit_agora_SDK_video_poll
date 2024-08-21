import {
  Box,
  IconButton,
  Popover,
  PopoverTrigger,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useRef } from "react";
import { BiErrorCircle } from "react-icons/bi";
import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";
import FileDrop from "_components/pageComponents/Other/FileDrop";
import CustomToast from "_components/pageComponents/Other/Toast";
import { ContentCount } from "..";
import { CustomEditor } from "../functions";

interface ToolbarBtn {
  active: boolean;
  btn: Btn;
  btnSize: string;
  editor: BaseEditor & ReactEditor;
  setImgs?: (imgs: any[]) => void;
  imgs?: any[];
  limit?: number;
  currCount?: ContentCount;
  editorType?: string;
}

interface Btn {
  format: string;
  displayName: string;
  btnIcon: JSX.Element;
  type: string;
}

export const MarkButton = ({ active, btn, btnSize, editor }: ToolbarBtn) => {
  return (
    <IconButton
      aria-label={btn.format}
      title={btn.displayName}
      size={btnSize}
      onMouseDown={(e) => {
        e.preventDefault();
        CustomEditor.toggleMark(editor, btn.format);
      }}
      _focus={{ outline: "none" }}
      bgColor={active ? "gray.500" : "gray.100"}
      color={active ? "white" : "black"}
    >
      {btn.btnIcon || btn.format}
    </IconButton>
  );
};

export const BlockButton = ({ active, btn, btnSize, editor }: ToolbarBtn) => {

  return (
    <IconButton
      aria-label={btn.format}
      title={btn.displayName}
      size={btnSize}
      onMouseDown={(e) => {
        e.preventDefault();
        CustomEditor.toggleBlock(editor, btn.format);
      }}
      _focus={{ outline: "none" }}
      bgColor={active ? "gray.500" : "gray.100"}
      color={active ? "white" : "black"}
    >
      {btn.btnIcon || btn.format}
    </IconButton>
  );
};

export const LinkButton = ({ active, btn, btnSize, editor }: ToolbarBtn) => {
  return (
    <IconButton
      aria-label={btn.format}
      title={btn.displayName}
      size={btnSize}
      onMouseDown={(e) => {
        e.preventDefault();
        const url = window.prompt("Enter the URL of the link:");
        if (!url) return;
        CustomEditor.addLink(editor, url as any);
      }}
      _focus={{ outline: "none" }}
      bgColor={active ? "gray.500" : "gray.100"}
      color={active ? "white" : "black"}
    >
      {btn.btnIcon || btn.format}
    </IconButton>
  );
};

export const EmbedButton = ({
  active,
  btn,
  btnSize,
  editor,
  imgs,
  setImgs,
  limit,
  currCount,
  editorType,
}: ToolbarBtn) => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const firstFieldRef = useRef(null);
  const toast = useToast();

  const addMedia = (fileType: string, file: any) => {
    if (currCount && limit && currCount?.mediaCount === limit) {
      toast({
        id: "imgMax",
        duration: 2000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={"You reached the maximum number of images or videos allowed"}
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });
      return;
    }

    setImgs && imgs && setImgs([...imgs, file]);

    CustomEditor.insertEmbed(
      editor,
      { url: file.preview, width: "100%", height: "350px", name: file.name },
      fileType === "IMAGE" ? "image" : "video"
    );
  };

  return (
    <Box title={btn.displayName}>
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
            size={btnSize}
            marginRight="8px"
            color={isOpen ? "white" : "gray.800"}
            _active={{ outline: "none" }}
            _focus={{ outline: "none" }}
            //   icon={<CgImage />}
            bg={isOpen ? "gray.500" : "gray.100"}
          >
            {btn.btnIcon || btn.format}
          </IconButton>
        </PopoverTrigger>
        <FileDrop maxFiles={1} close={onClose} addMedia={addMedia} />
      </Popover>
    </Box>
  );
};
