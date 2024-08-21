import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  useMediaQuery,
  useToast,
} from "@chakra-ui/react";
import {
  createEditor,
  BaseEditor,
  Descendant,
  BaseSelection,
  Range,
  Transforms,
  Node,
  BaseRange,
  Editor,
} from "slate";
import { HistoryEditor, withHistory } from "slate-history";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { MutableRefObject, useCallback, useEffect, useState } from "react";
import Toolbar from "./Toolbar";
import { Element, LeafElement } from "./components";
import { CustomEditor } from "./functions";
import Scrollbars from "../Other/Scrollbar";
import { CounterTag } from "../Other/RichText/toolbar/toolbarBtns";
import { RiImageEditLine, RiText } from "react-icons/ri";
import { isURL, LINK_REGEX } from "_components/globalFuncs";
import CustomLink from "../Other/Media/LinkOverlay";
import CustomToast from "../Other/Toast";
import { BiErrorCircle } from "react-icons/bi";

export type CustomElement = { type: "paragraph"; children: CustomText[] };
export type CustomText = {
  bold?: any;
  text: string;
};
export type ContentCount = { contentCount: number; mediaCount: number };

export type LinkElement = { type: "link"; url: string; children: CustomText[] };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement | LinkElement;
    Text: CustomText;
  }
}

type charCountProps = {contentCount: number; mediaCount: number}

interface InputData {
  txtMax: number;
  editorType: string;
  placeholderTxt: string;
  editor: BaseEditor & ReactEditor & HistoryEditor;
  input: Descendant[];
  updateInput: (nodes: Descendant[]) => void;
  minHeight: string;
  maxHeight: string;
  countCharacters: (content: charCountProps) => void;
  charCount: charCountProps;
}
interface RichTextEditor {
  styles: any;
  inputData: InputData;
}

export interface UrlPos {
  value: string;
  target: BaseRange | undefined;
  index: number;
}

// const initalContentCounts = { contentCount: 0, mediaCount: 0 };

const initialValue: any[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const MiniTextEditor = ({ styles, inputData }: RichTextEditor) => {
  const {
    txtMax,
    editorType,
    placeholderTxt,
    minHeight,
    maxHeight,
    editor,
    input,
    updateInput,
    countCharacters,
    charCount,
  } = inputData;
  // const [contentLength, setContentLength] = useState(initalContentCounts);
  const [maxPos, setMaxPos] = useState<BaseSelection>(null);
  const [isMobile] = useMediaQuery("(max-width: 1000px)");

  const toast = useToast();

  const renderElement = useCallback(
    (props) => <Element {...props} removeMedia={removeMedia} />,
    []
  );

  const renderLeaf = useCallback((props) => {
    return <LeafElement {...props} />;
  }, []);

  const removeMedia = (element: any) => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: path });
    Transforms.move(editor, { unit: "offset" });
  };

  // const removeLink = (element: any) => {
  //   const path = ReactEditor.findPath(editor, element);
  //   Transforms.removeNodes(editor, { at: path });
  //   Transforms.move(editor, { unit: "offset" });
  // };

  const stopContentOnMax = (chrLength: number, ctx: Descendant[]) => {
    chrLength === txtMax && setMaxPos(editor.selection);
    chrLength > txtMax && CustomEditor.deleteForwardContent(maxPos, editor);
  };

  const stopContentPasteIfMax = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (
      e.clipboardData.getData("Text").length + charCount.contentCount >
      txtMax
    ) {
      toast({
        id: "minMaxMulti",
        duration: 3000,
        position: "bottom",
        render: () => (
          <CustomToast
            msg={
              "You cannot paste this content because it will put you over the content limit!"
            }
            bg={"red.300"}
            fontColor={"white"}
            iconSize={"20px"}
            Icon={BiErrorCircle}
          />
        ),
      });
      e.preventDefault();
    }
  };

  const linkNodes = CustomEditor.getAllLinkNodes(editor.children);
  const lastLink = linkNodes[linkNodes.length - 1];

  const handleControlledInput = (nodes: Descendant[]) => {
    const chrLength = CustomEditor.getContentLength(nodes);
    stopContentOnMax(chrLength.contentCount, nodes);
    countCharacters(CustomEditor.getContentLength(nodes));
    updateInput(nodes);
  };

  useEffect(() => {
    const plainTxt = CustomEditor.getPlainText(input as any).join("");
    plainTxt.length > 0 && handleControlledInput(editor.children);

    return () => {
      ["Create Answer", "Create Poll"].includes(editorType) &&
        updateInput(initialValue);
    };
  }, []);

  return (
    <Flex {...styles} flexDirection="column">
      <Slate
        editor={editor}
        value={input}
        onChange={(ctx) => {
          handleControlledInput(ctx);
        }}
      >
        {/* <Toolbar
            editor={editor}
            mediaMax={mediaMax}
            contentCount={contentLength}
            isMobile={isMobile}
            imgs={imgs}
            setImgs={updateImgs}
            editorType={editorType}
          /> */}
        <Scrollbars style={{ minHeight, maxHeight }}>
          <Box p="2">
            <Editable
              onPaste={(e) => stopContentPasteIfMax(e)}
              placeholder={placeholderTxt}
              renderElement={renderElement}
              autoFocus
              renderLeaf={renderLeaf}
              onKeyDown={(event) => keyHandler(event, editor)}
            />
            {linkNodes.length > 0 && (
              <Flex justifyContent={"center"} p="2" m="3">
                <CustomLink
                  link={
                    !lastLink.startsWith("https")
                      ? "https://" + linkNodes[linkNodes.length - 1]
                      : lastLink
                  }
                />
              </Flex>
            )}
          </Box>
        </Scrollbars>
        {/* <HStack bg="gray.100">
            <CounterTag
              Icon={RiText}
              size="md"
              count={contentLength.contentCount}
              max={txtMax}
            />
            <CounterTag
              Icon={RiImageEditLine}
              size="md"
              count={contentLength.mediaCount}
              max={mediaMax}
            />
          </HStack> */}
      </Slate>
    </Flex>
  );
};

export default MiniTextEditor;

const keyHandler = (
  e: React.KeyboardEvent<HTMLDivElement>,
  editor: BaseEditor & ReactEditor
) => {
  if (!e.ctrlKey) {
    return;
  }

  switch (e.key) {
    // case "`": {
    //   // When "`" is pressed, keep our existing code block logic.
    //   e.preventDefault();
    //   CustomEditor.toggleCodeBlock(editor);
    // }

    case "b": {
      // When "B" is pressed, bold the text in the selection.
      e.preventDefault();
      CustomEditor.toggleMark(editor, "bold");
      return;
    }
    case "i": {
      // When "i" is pressed, bold the text in the selection.
      e.preventDefault();
      CustomEditor.toggleMark(editor, "italic");
      return;
    }

    case "u": {
      // When "u" is pressed, bold the text in the selection.
      e.preventDefault();
      CustomEditor.toggleMark(editor, "underline");
      return;
    }
  }
};
