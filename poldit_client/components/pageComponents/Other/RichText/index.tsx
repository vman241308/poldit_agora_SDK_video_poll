import { Box, Flex, useToast } from "@chakra-ui/react";
import {
  convertToRaw,
  EditorState,
  ContentState,
  Modifier,
  RawDraftContentState,
  RichUtils,
  Editor,
  AtomicBlockUtils,
} from "draft-js";
import { useEffect, useRef, useState } from "react";
import { BiErrorCircle } from "react-icons/bi";
import { LINK_REGEX } from "_components/globalFuncs";
import CustomLink from "../Media/LinkOverlay";
import Scrollbars from "../Scrollbar";
import CustomToast from "../Toast";
import { CustomMediaRender } from "./blockRenders";
import { createLinkDecorator } from "./Decorators";
import ToolBar from "./toolbar";
import editorStyle from "./editorStyles.module.css";
import "draft-js/dist/Draft.css";

export interface InputData {
  imgMax: number;
  txtMax: number;
  imgs: any[];
  inputTxt: string;
}

interface CustomEditor {
  setVal: (val: any) => void;
  updateImg: (val: string[]) => void;
  styles: any;
  editorState: EditorState;
  placeholderTxt?: string;
  setEditorState: (state: EditorState) => void;
  inputData: InputData;
}

// const createLinkDecorator = () =>
//   new CompositeDecorator([
//     {
//       strategy: LinkStrategy,
//       component: LinkText,
//     },
//   ]);

const CustomEditor = ({
  setVal,
  updateImg,
  styles,
  editorState,
  placeholderTxt,
  setEditorState,
  inputData,
}: CustomEditor) => {
  const [prevList, setPrevList] = useState<string[]>([]);
  const [entityKey, setEntityKey] = useState("");
  const toast = useToast();
  const ref = useRef(null);

  const focus = () => (ref as any).current.editor.focus();

  const logData = () => {
    console.log(convertToRaw(editorState.getCurrentContent()));
  };

  const handlePrevUrls = (editorState: EditorState) => {
    const contentState = editorState.getCurrentContent();
    const { entityMap } = convertToRaw(contentState);
    const keys = Object.keys(entityMap);

    let finalList: string[] = [];
    if (keys.length > 0) {
      for (const key in entityMap) {
        const element = entityMap[key];
        if (element.type === "LINK" && !finalList.includes(element.data.url)) {
          finalList.push(element.data.url);
        }
      }
    }
    setPrevList(finalList);
  };

  const handleLink = (
    textVal: string,
    currContent: ContentState,
    editorState: EditorState
  ) => {
    const urls = textVal.match(LINK_REGEX);

    if (urls && urls?.length > 0) {
      const url = urls[urls.length - 1];
      const trueUrl = !url.startsWith("https") ? "https://" + url : url;

      if (!prevList.includes(trueUrl)) {
        const decorator = createLinkDecorator();

        const selectionState = editorState.getSelection();
        const end = selectionState.getEndOffset();
        const start = end - url.length;
        const selection = selectionState.merge({
          anchorOffset: start,
          focusOffset: end,
        });

        const urlEntity = currContent.createEntity("LINK", "MUTABLE", {
          url: trueUrl,
        });
        const entityKey = currContent.getLastCreatedEntityKey();

        const newEntity = Modifier.applyEntity(
          currContent,
          selection,
          entityKey
        );

        const newState = EditorState.createWithContent(newEntity, decorator);
        return EditorState.forceSelection(newState, selectionState);
      }
    }
  };

  const forceRefresh = (editorState: EditorState) => {
    const selectionState = editorState.getSelection();
    return EditorState.forceSelection(editorState, selectionState);
  };

  const handleChange = (state: EditorState) => {
    const currContent = state.getCurrentContent();
    const oldContent = editorState.getCurrentContent();

    const textVal = currContent.getPlainText();
    const rawContent = convertToRaw(currContent);
    const imgs = getMediaObjs(state, rawContent);

    if (
      currContent === oldContent ||
      (textVal.length <= inputData.txtMax && imgs.length <= inputData.imgMax)
    ) {
      let finalState: EditorState = state;

      const urlState = handleLink(textVal, currContent, state);
      setVal(textVal);

      if (urlState) {
        finalState = urlState;
        handlePrevUrls(finalState);
      }

      setEditorState(finalState);
    } else {
      const newState = EditorState.undo(
        EditorState.push(
          editorState,
          ContentState.createFromText(oldContent.getPlainText()),
          "delete-character"
        )
      );
      setEditorState(newState);
    }
  };

  const getMediaObjs = (
    editorState: EditorState,
    rawContent: RawDraftContentState
  ) => {
    const value = {
      blocks: [...rawContent.blocks],
      entityMap: { ...rawContent.entityMap },
    };
    (value as any).entityMap = Object.keys(value.entityMap).map(
      (i) => value.entityMap[i]
    );

    const imageObjs = (value.entityMap as any).filter(
      (x: { type: string }) => x.type === "IMAGE" || x.type === "VIDEO"
    );

    const imgs = imageObjs.map(
      (item: { data: { src: any } }) => item.data.src
    ) as string[];

    if (imgs.length !== inputData.imgs.length) {
      updateImg(imgs);
      forceRefresh(editorState);
    }

    return imgs;
  };

  const closeHandler = () => {
    setPrevList([]);
  };

  const onAddLink = (editorState: EditorState) => {
    let linkUrl = window.prompt("Add link https://");
    const decorator = createLinkDecorator();
    if (linkUrl) {
      let displayLink = window.prompt("Display Text");
      if (displayLink) {
        const currentContent = editorState.getCurrentContent();
        const createEntity = currentContent.createEntity("LINK", "MUTABLE", {
          url: linkUrl,
        });

        let entityKey = currentContent.getLastCreatedEntityKey();
        const selection = editorState.getSelection();
        const textWithEntity = Modifier.insertText(
          currentContent,
          selection,
          displayLink,
          null as any,
          entityKey
        );
        let newState = EditorState.createWithContent(textWithEntity, decorator);
        setEditorState(newState);
      }
    }
  };

  const onAddMedia = (urlType: string, file: any) => {
    if (inputData.imgs.length === inputData.imgMax) {
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
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity(
      urlType,
      "IMMUTABLE",
      { src: file.preview }
    );
    let entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const myTst = Object.assign(file, { entityKey });
    const newEditorState = EditorState.set(editorState, {
      currentContent: contentStateWithEntity,
    });
    updateImg([...inputData.imgs, file]);
    setEditorState(
      AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " ")
    );
  };

  const handleKeyCommand = (command: string, state: EditorState) => {
    const newState = RichUtils.handleKeyCommand(state, command);

    if (newState) {
      setEditorState(newState);
      return true;
    }
    return false;
  };

  let editorClass = "RichEditor-editor";
  const contentState = editorState.getCurrentContent();
  if (!contentState.hasText()) {
    if (contentState.getBlockMap().first().getType() !== "unstyled") {
      editorClass += " RichEditor-hidePlaceholder";
    }
  }

  useEffect(() => {
    $(".DraftEditor-editorContainer div")
      .attr("autocomplete", "off")
      .attr("autocorrect", "off")
      .attr("autocapitalize", "off");
  }, []);

  // const handleBlockStyles = () => {
  //   let placeholderBlockType;
  //   const contentState = editorState.getCurrentContent();
  //   if (!contentState.hasText()) {
  //     console.log('no Text: ', contentState.hasText())
  //     placeholderBlockType = contentState.getBlockMap().first().getType();
  //   }
  //   return 'unstyled'

  // };

  // useEffect(() => {
  //   let placeholderBlockType;
  //   const contentState = editorState.getCurrentContent();
  //   if (!contentState.hasText()) {
  //     placeholderBlockType = contentState.getBlockMap().first().getType();
  //   }
  // }, []);

  return (
    <Flex
      {...styles}
      flexDirection={"column"}
      className={editorStyle["RichEditor-root"]}
    >
      <ToolBar
        editorState={editorState}
        updateEditorState={handleChange}
        link={onAddLink}
        addMedia={onAddMedia}
        inputData={inputData}
      />
      <Scrollbars style={{ minHeight: "200px", maxHeight: "580px" }}>
        <Box p="2" className={editorStyle[editorClass]}>
          <Editor
            editorKey="editor"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            editorState={editorState}
            onChange={handleChange}
            handleKeyCommand={handleKeyCommand as any}
            placeholder={placeholderTxt ? placeholderTxt : ""}
            spellCheck={false}
            ref={ref}
            blockRendererFn={CustomMediaRender}
            // blockStyleFn={handleBlockStyles}
          />
        </Box>
        {prevList.length > 0 && (
          <Flex justifyContent={"center"} p="2" m="3">
            <CustomLink
              link={prevList[prevList.length - 1]}
              close={closeHandler}
            />
          </Flex>
        )}
      </Scrollbars>
    </Flex>
  );
};

export default CustomEditor;
