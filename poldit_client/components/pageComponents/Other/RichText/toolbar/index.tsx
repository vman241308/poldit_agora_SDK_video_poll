import { Flex, HStack } from "@chakra-ui/react";
import { EditorState } from "draft-js";
import { RiImageEditLine, RiText } from "react-icons/ri";
import { InputData } from "..";

import {
  InlineStyleBtns,
  BlockStyleBtns,
  LinkBtn,
  ImgBtn,
  CounterTag,
  EmojiBtn,
} from "./toolbarBtns";

export type AddMedia = (urlType: string, files: any) => void;
// export type AddMedia = (urlType: string, urlValue: string) => void;

interface ToolBar {
  editorState: EditorState;
  updateEditorState: (state: EditorState) => void;
  link: (state: EditorState) => void;
  addMedia: AddMedia;
  inputData: InputData;
}

const ToolBar = ({
  editorState,
  updateEditorState,
  link,
  addMedia,
  inputData,
}: ToolBar) => {
  return (
    <Flex
      p="2"
      boxShadow="0px 0px 3px 1px rgba(15, 15, 15, 0.17)"
      justifyContent={"space-between"}
    >
      <HStack spacing={"2"}>
        <InlineStyleBtns
          editorState={editorState}
          updateEditorState={updateEditorState}
        />

        {/* <BlockStyleBtns
          editorState={editorState}
          updateEditorState={updateEditorState}
        /> */}
        {/* <LinkBtn link={link} editorState={editorState} /> */}
        <ImgBtn editorState={editorState} addMedia={addMedia} />
        {/* <EmojiBtn editorState={editorState}/> */}
      </HStack>
      <HStack>
        <CounterTag
          Icon={RiText}
          size="md"
          count={inputData.inputTxt.length}
          max={inputData.txtMax}
        />
        <CounterTag
          Icon={RiImageEditLine}
          size="md"
          count={inputData.imgs.length}
          max={inputData.imgMax}
        />
      </HStack>
    </Flex>
  );
};

export default ToolBar;
