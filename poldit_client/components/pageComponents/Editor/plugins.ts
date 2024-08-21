import { BaseEditor, Element, Node, Transforms, Editor, Range } from "slate";
import { ReactEditor } from "slate-react";
import { Transform } from "stream";
import { isURL, LINK_REGEX } from "_components/globalFuncs";
import { CustomEditor } from "./functions";

export const withInlines = (editor: BaseEditor & ReactEditor) => {
  const {
    insertData,
    insertText,
    isInline,
    deleteBackward,
    onChange,
    normalizeNode,
  } = editor;

  editor.isInline = (e) => (e.type === "link" ? true : isInline(e));

  // editor.normalizeNode = (entry) => {
  //   const [node, path] = entry;

  //   if (Element.isElement(node) && node.type === "link") {
  //     for (const [child, childPath] of Node.children(editor, path) as any) {
  //       if (!Element.isElement(child) && !Node.string(child)) {
  //         Transforms.unwrapNodes(editor, { at: path, split: true });
  //         // Editor.deleteBackward(editor, { unit: 'character'});
  //         return;
  //       }
  //     }
  //   }

  //   normalizeNode(entry);
  // };

  editor.insertText = (text) => {
    CustomEditor.insertLinkOnUrlText(editor, text);
    insertText(text);
  };

  editor.insertData = (data) => {
    const text = data.getData("text/plain");
    const urlMatch = text && text.match(LINK_REGEX);

    if (text && urlMatch) {
      CustomEditor.wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  editor.deleteBackward = (unit) => {
    CustomEditor.detectUrlAndRemove(editor);

    return deleteBackward(unit);
  };

  return editor;
};

export const withEmbeds = (editor: BaseEditor & ReactEditor) => {
  const { isVoid } = editor;

  editor.isVoid = (element) =>
    ["video", "image"].includes(element.type) ? true : isVoid(element);
  return editor;
};

// export const withImages = (editor: BaseEditor & ReactEditor) => {
//   const { insertData, isVoid } = editor;

//   editor.isVoid = (element: any) => {
//     return element.type === "image" ? true : isVoid(element);
//   };

//   editor.insertData = (data:any) => {
//     const text = data.getData('text/plain')
//     const { files } = data

//     if (files && files.length > 0) {
//       for (const file of files) {
//         const reader = new FileReader()
//         const [mime] = file.type.split('/')

//         if (mime === 'image') {
//           reader.addEventListener('load', () => {
//             const url = reader.result
//             insertImage(editor, url)
//           })

//           reader.readAsDataURL(file)
//         }
//       }
//     } else if (isImageUrl(text)) {
//       insertImage(editor, text)
//     } else {
//       insertData(data)
//     }
//   }

//   return editor

// };
