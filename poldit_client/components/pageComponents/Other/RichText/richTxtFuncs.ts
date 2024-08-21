import {
  convertToRaw,
  EditorState,
  ContentState,
  Modifier,
  ContentBlock,
  Entity,
  SelectionState,
  CharacterMetadata,
  convertFromRaw,
  convertFromHTML,
  RawDraftContentState,
  EntityInstance,
  DraftInlineStyle,
} from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import { CustomEditor } from "_components/pageComponents/Editor/functions";

export const richTxt_toTxt = (content: string) => {
  let trueContent = "";

  if (content.startsWith('[{"type":')) {
    trueContent = CustomEditor.getPlainText(JSON.parse(content)).join("\n");
  } else if (content.search('"blocks":') > -1) {
    const questionRawContent: RawDraftContentState = JSON.parse(content);
    trueContent = convertFromRaw(questionRawContent).getPlainText();
  } else {
    trueContent = content;
  }

  return trueContent;
};

export const parseIntoRichTxt = (
  content: ContentState,
  contentType: string
) => {
  let options = {
    entityStyleFn: (entity: any) => {
      const entityType = entity.get("type").toLowerCase();
      if (entityType === "link") {
        const data = entity.getData();
        return {
          element: "a",
          attributes: {
            target: "_blank",
            rel: "noopener noreferrer",
            href: data.url,
          },
          style: {
            color: "#1e90ff",
            fontWeight: "600",
          },
        };
      }

      if (entityType === "image") {
        const data = entity.getData();
        return {
          element: "img",
          attributes: {
            src: data.src,
          },
          style: {
            height: "300px",
            width: "auto",
            padding: "none",
          },
        };
      }
    },
    blockStyleFn: (block: ContentBlock) => {
      const data = block.get("text");

      if (data && data !== " " && contentType === "Answer") {
        return {
          style: {
            padding: "0px 20px 10px 20px",
          },
        };
      }
    },
  };

  return stateToHTML(content, options);

  // let newContent: RawDraftContentState = content;
  // let { blocks, entityMap } = newContent;

  // const entityKeys = Object.keys(newContent);

  // if (entityKeys.length > 0) {
  //   for (const key in entityMap) {
  //     const element = entityMap[key];
  //     if (element.type === "LINK") {
  //       element.data = {
  //         ...element.data,
  //         targetOption: "_blank",
  //         rel: "noopener noreferrer",
  //       };
  //     }
  //   }
  // }
};

export const emptyContentState = convertFromRaw({
  entityMap: {},
  blocks: [
    {
      text: "",
      key: "foo",
      type: "unstyled",
      entityRanges: [],
      depth: 0,
      inlineStyleRanges: [],
    },
  ],
});
