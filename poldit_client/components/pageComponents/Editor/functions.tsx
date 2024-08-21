import e from "express";
import {
  BaseEditor,
  Editor,
  Transforms,
  Text,
  Element as SlateElement,
  Node,
  Range,
  Descendant,
  Path,
  BaseSelection,
  Point,
} from "slate";
import { ReactEditor, useSlate } from "slate-react";
import { isURL, LINK_REGEX } from "_components/globalFuncs";
import { CustomText, LinkElement, UrlPos } from ".";

// const list_types = ["orderedList", "unorderedList"];
const list_types = ["orderedList", "bulleted-list"];

interface MediaObj {
  url: string;
  width: string;
  height: string;
  name: string;
}

// export interface Node_Range {
//   anchor: Point;
//   focus: Point;
// }

export type ContentCount = { contentCount: number; mediaCount: number };

export type setActiveUrl = (url: UrlPos) => void;
// export type setActiveUrl = (url: string) => void;
export type setUrls = (urls: string[]) => void;

export interface CustomEditor_Fns {
  createImageNode: (alt: string, media: MediaObj) => void;
  createVideoNode: (media: MediaObj) => void;
  createParagraph: (val: string) => any;
  insertEmbed: (
    editor: BaseEditor & ReactEditor,
    embedData: MediaObj,
    formatType: string
  ) => void;
  isMarkActive: (
    editor: BaseEditor & ReactEditor,
    formatType: string
  ) => boolean;
  toggleMark: (editor: BaseEditor & ReactEditor, formatType: string) => void;
  isBlockActive: (
    editor: BaseEditor & ReactEditor,
    formatType: string
  ) => boolean;
  toggleBlock: (editor: BaseEditor & ReactEditor, formatType: any) => void;
  getContentLength: (nodes: Descendant[]) => {
    contentCount: number;
    mediaCount: number;
  };
  getCharLength: (nodes: Descendant[]) => number;
  wrapLink: (editor: BaseEditor & ReactEditor, url: string) => void;
  maxContentReached: (
    contentLength: ContentCount,
    txtMax: number,
    imgMax: number
  ) => boolean;
  deleteForwardContent: (
    posStart: BaseSelection,
    editor: BaseEditor & ReactEditor
  ) => void;
  isLinkActive: (editor: BaseEditor & ReactEditor) => boolean;
  getPlainText: (nodes: Descendant[]) => string[];
  unwrapLink: (editor: BaseEditor & ReactEditor) => void;
  removeLinkText: (editor: BaseEditor & ReactEditor, activeUrl: string) => void;
  addLink: (editor: BaseEditor & ReactEditor, url: UrlPos | null) => void;
  getAllLinkNodes: (nodes: Descendant[]) => string[];
  hasEditorChanged: (origNodes: string, existingNodes: Descendant[]) => boolean;
  detectUrlAndRemove: (editor: BaseEditor & ReactEditor) => void;
  insertLinkOnUrlText: (editor: BaseEditor & ReactEditor, text: string) => void;
  removeNodes: (editor: BaseEditor & ReactEditor, nodeType: string) => void;
}

export const CustomEditor: CustomEditor_Fns = {
  removeNodes: (editor, nodeType) => {
    Transforms.removeNodes(editor, {
      match: (node: any) => node.type === nodeType,
    });
  },
  detectUrlAndRemove: (editor) => {
    const { selection } = editor;

    if (selection) {
      const inlineLinks = Editor.previous(editor, {
        match: (n: any, p) => n.type === "link",
      });

      const prevText = Editor.previous(editor);

      if (prevText) {
        const lastTxt = (prevText[0] as any).text;
        const urlMatch = lastTxt && lastTxt.match(LINK_REGEX);

        if (inlineLinks && urlMatch) {
          CustomEditor.unwrapLink(editor);
        }
      }
    }
  },
  insertLinkOnUrlText: (editor, text) => {
    const { selection } = editor;

    if (selection) {
      const prevText = Editor.previous(editor, { mode: "lowest" });
      const fullTextStr = prevText && (prevText[0] as any);
      const fullTxt = fullTextStr && fullTextStr.text;

      if (prevText && fullTxt) {
        const splitTxt = fullTxt.split(" ");
        const lastWord = splitTxt[splitTxt.length - 1].trim();

        const urlMatch = lastWord && lastWord.match(LINK_REGEX);

        if (lastWord && urlMatch && text === " ") {
          const link: LinkElement = {
            type: "link",
            url: !lastWord.startsWith("https")
              ? "https://" + lastWord
              : lastWord,
            children: [{ text: lastWord }],
          };

          Transforms.insertNodes(editor, link, {
            at: {
              anchor: selection.anchor,
              focus: {
                path: selection.anchor.path,
                offset: selection.anchor.offset - lastWord.length,
              },
            },
          });

          Transforms.move(editor, { distance: lastWord.length });
          Transforms.move(editor, { unit: "offset" });
        }
      }
    }
  },
  hasEditorChanged: (origNodes, existingNodes) => {
    return origNodes === JSON.stringify(existingNodes);
  },
  getAllLinkNodes: (nodes) => {
    let links: string[] = [];

    nodes.forEach((x: any) => {
      const childLinks: string[] = x.children
        .filter((y: any) => y.type == "link")
        .map((z: any) => Node.string(z));

      childLinks.forEach((y) => y && links.push(y));
    });

    return links;
  },

  isLinkActive: (editor) => {
    const [link]: any = Editor.nodes(editor, {
      match: (n: any) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
    });
    return !!link;
  },

  getPlainText: (nodes) => {
    return nodes
      .filter(
        (x: any) =>
          !["image", "video"].includes(x.type) && Node.string(x) !== ""
      )
      .map((x) => Node.string(x));
  },
  removeLinkText: (editor, activeUrl) => {
    editor.selection &&
      Transforms.delete(editor, {
        distance: activeUrl.length,
        reverse: true,
      });
  },
  unwrapLink: (editor) => {
    Transforms.unwrapNodes(editor, {
      split: true,
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
    });
  },
  wrapLink: (editor, url) => {
    if (CustomEditor.isLinkActive(editor)) {
      CustomEditor.unwrapLink(editor);
    }

    const { selection } = editor;
    const isCollapsed = selection && Range.isCollapsed(selection);
    const link: LinkElement = {
      type: "link",
      url: !url.startsWith("https") ? "https://" + url : url,
      children: isCollapsed ? [{ text: url }] : [],
    };

    if (isCollapsed) {
      Transforms.insertNodes(editor, link);
    } else {
      Transforms.wrapNodes(editor, link, { split: true });
      Transforms.collapse(editor, { edge: "end" });
    }

    Transforms.move(editor, { unit: "offset" });
  },
  addLink: (editor, url) => {
    const fullUrl = !url?.value.startsWith("https")
      ? "https://" + url?.value
      : url.value;
    const link: any = {
      type: "link",
      url: fullUrl,
      children: [{ text: url?.value ?? "" }],
    };
    CustomEditor.removeLinkText(editor, url?.value ?? "");
    Transforms.insertNodes(editor, link);
    Transforms.move(editor, { unit: "offset" });
  },
  deleteForwardContent: (posStart, editor) => {
    const currentLoc = editor.selection;

    currentLoc &&
      Transforms.delete(editor, {
        at: {
          anchor: {
            path: posStart?.anchor.path as Path,
            offset: posStart?.anchor.offset as number,
          },
          focus: {
            path: currentLoc?.anchor.path as Path,
            offset: currentLoc?.anchor.offset as number,
          },
        },
      });
  },
  maxContentReached: (contentLength, txtMax, imgMax) => {
    if (contentLength.contentCount >= txtMax) {
      return true;
    }
    return false;
  },
  getCharLength: (nodes) => {
    return nodes
      .filter(
        (x: any) =>
          !["image", "video"].includes(x.type) && Node.string(x) !== ""
      )
      .map((x) => Node.string(x))
      .join("").length;
  },
  getContentLength: (nodes) => {
    const textCount = nodes
      .filter(
        (x: any) =>
          !["image", "video"].includes(x.type) && Node.string(x) !== ""
      )
      .map((x) => Node.string(x))
      .join("").length;

    const mediaCount = nodes.filter(
      (x: any) => x.type === "image" || x.type === "video"
    ).length;
    return { contentCount: textCount, mediaCount: mediaCount };
  },
  createImageNode: (alt, { url, width, height, name }) => {
    return {
      type: "image",
      alt,
      url,
      width,
      height,
      name,
      children: [{ text: "" }],
    };
  },
  createVideoNode: ({ url, width, height }: MediaObj) => {
    return { type: "video", url, width, height, children: [{ text: "" }] };
  },
  createParagraph: (text: string) => ({
    type: "paragraph",
    children: [{ text }],
  }),

  insertEmbed: (editor, embedData, formatType) => {
    const { url, width, height, name } = embedData;
    if (!url) return;

    const embed: any =
      formatType === "image"
        ? CustomEditor.createImageNode("EditorImage", embedData)
        : CustomEditor.createVideoNode(embedData);

    Transforms.insertNodes(editor, embed, { select: true });
    Transforms.insertNodes(editor, CustomEditor.createParagraph("") as any, {
      mode: "highest",
    });
  },

  isMarkActive: (editor, formatType) => {
    const marks: any = Editor.marks(editor);
    return marks ? marks[formatType] === true : false;
  },
  toggleMark: (editor, formatType) => {
    const isActive = CustomEditor.isMarkActive(editor, formatType);

    if (isActive) {
      Editor.removeMark(editor, formatType);
    } else {
      Editor.addMark(editor, formatType, true);
    }
    ReactEditor.focus(editor);
  },

  isBlockActive: (editor, formatType) => {
    const { selection } = editor;
    if (!selection) return false;

    const [match]: any = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === formatType,
    });

    return !!match;
  },
  toggleBlock: (editor, formatType) => {
    const isActive = CustomEditor.isBlockActive(editor, formatType);
    const isList = list_types.includes(formatType);

    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        list_types.includes(n.type),
      // list_types.includes(
      //   !Editor.isEditor(n) && SlateElement.isElement(n) && (n.type as any)
      // ),
      split: true,
    });

    Transforms.setNodes<SlateElement>(editor, {
      type: isActive ? "paragraph" : isList ? "list-item" : formatType,
    } as any);

    if (isList && !isActive) {
      Transforms.wrapNodes(editor, {
        type: formatType,
        children: [],
      });
    }
  },
};
