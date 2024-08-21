import { Box, HStack, IconButton, useMediaQuery } from "@chakra-ui/react";
import { BaseEditor } from "slate";
import { ReactEditor, useSlate } from "slate-react";
import { toolbarBtns } from "./data";
import { CustomEditor } from "./functions";
import { RiHeading } from "react-icons/ri";
import { useState } from "react";
import { BlockButton, EmbedButton, LinkButton, MarkButton } from "./buttons";
import { ContentCount } from ".";

interface ToolbarType {
  editor: BaseEditor & ReactEditor;
  mediaMax: number;
  contentCount: ContentCount;
  isMobile: boolean;
  imgs: any[];
  setImgs: (imgs: any[]) => void;
  editorType: string;
}

const Toolbar = ({
  editor,
  mediaMax,
  contentCount,
  isMobile,
  imgs,
  setImgs,
  editorType,
}: ToolbarType) => {
  const [toolbarBtnGrps, setToolBarBtnGrps] = useState(toolbarBtns);

  return (
    <Box border="1px" borderColor={"gray.200"} p="3">
      <HStack>
        {toolbarBtnGrps.map((x, idx) => {
          switch (x.type) {
            case "block":
              return (
                <BlockButton
                  key={idx}
                  active={CustomEditor.isBlockActive(editor, x.format)}
                  btn={x}
                  btnSize={isMobile ? "xs" : "sm"}
                  editor={editor}
                />
              );
            case "mark":
              return (
                <MarkButton
                  key={idx}
                  active={CustomEditor.isMarkActive(editor, x.format)}
                  btn={x}
                  btnSize={isMobile ? "xs" : "sm"}
                  editor={editor}
                />
              );
            case "embed":
              return (
                <EmbedButton
                  key={idx}
                  active={CustomEditor.isBlockActive(editor, x.format)}
                  btn={x}
                  btnSize={isMobile ? "xs" : "sm"}
                  editor={editor}
                  imgs={imgs}
                  setImgs={setImgs}
                  limit={mediaMax}
                  currCount={contentCount}
                  editorType={editorType}
                />
              );
            // case "link":
            //   return (
            //     <LinkButton
            //       key={idx}
            //       active={CustomEditor.isLinkActive(editor)}
            //       btn={x}
            //       btnSize={isMobile ? "xs" : "sm"}
            //       editor={editor}
            //       limit={mediaMax}
            //       currCount={contentCount}
            //     />
            //   );
          }
        })}
      </HStack>
    </Box>
  );
};

export default Toolbar;
