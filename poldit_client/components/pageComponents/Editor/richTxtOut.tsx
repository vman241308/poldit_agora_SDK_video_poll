import {
  Box,
  OrderedList,
  Link,
  Flex,
  Collapse,
  Text as ChakraTxt,
  Button,
} from "@chakra-ui/react";
import DOMPurify from "dompurify";
import escapeHtml from "escape-html";
import { Text, Node, Descendant } from "slate";
import { LinkElement, CustomText } from ".";
import CustomLink from "../Other/Media/LinkOverlay";
import EditorMedia from "./customElements";
import { CustomEditor } from "./functions";
import { useWindowSize } from "_pageComponents/Window/windowSize";
import CollapseCtr from "_components/design/Collapse";
import { useState } from "react";
import styles from "./richTxtOut.module.css";

export interface RickTxtContainer {
  nodes: Node[];
  pollId: string | undefined;
  toggleShow?: () => void;
  goToPoll: () => void;
  contentType: string;
  show?: boolean;
  fontSize?: any;
  txtStyle?: any;
}

const RickTxtContainer = (props: RickTxtContainer) => {
  return <CollapseCtr {...props} />;
};

export default RickTxtContainer;

export const RichTxtCard = ({ node, showFull, txtStyle }: any) => {
  const data = serialize(node);

  DOMPurify.addHook("afterSanitizeAttributes", function (node) {
    // set all elements owning target to target=_blank
    if ("target" in node) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener");
    }
  });

  const questionContent = {
    __html: DOMPurify.sanitize(data),
  };

  if (["image", "video"].includes(node.type) && showFull) {
    return (
      <Box mt="10px" mb="10px">
        <EditorMedia
          attributes={{}}
          children={node}
          element={{
            url: node.url,
            width: "100%",
            height: node.height,
            type: node.type,
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      {...txtStyle}
      // className={`${styles.richTxtBox}`}
      dangerouslySetInnerHTML={questionContent}
    />
  );
};

export const serialize = (node: any) => {
  if (Text.isText(node)) {
    let string = escapeHtml(node.text);
    if (node.bold) {
      string = `<strong>${string}</strong>`;
    }

    if ((node as any).underline) {
      string = `<u>${string}</u>`;
    }

    if ((node as any).italic) {
      string = `<em>${string}</em>`;
    }

    return string;
  }

  // const nodeStyle = txtStyle ?? `style="padding-left:25px; padding-right:25px"`;
  // console.log(nodeStyle)

  const children = node.children.map((n: any) => serialize(n)).join("");

  switch (node.type) {
    case "quote":
      return `<blockquote><p>${children}</p></blockquote>`;
    case "paragraph":
      return `<p>${children}</p>`;
    // return `<p style="padding-left:25px; padding-right:25px">${children}</p>`;
    case "orderedList":
      return `<ol style="padding-left:60px; padding-right:30px">${children}</ol>`;
    case "bulleted-list":
      return `<ul style="padding-left:60px; padding-right:30px">${children}</ul>`;
    case "list-item":
      return `<li>${children}</li>`;
    case "link":
      return `<a style="color: #4299E1; font-weight: 600" href="${escapeHtml(
        node.url
      )}" >${children}</a>`;
    default:
      return children;
  }
};

export const getLinks = (nodes: any[]) => {
  let links: string[] = [];
  nodes.forEach((x) => {
    const childLinks: string[] = x.children
      .filter((y: any) => y.type == "link")
      .map((z: any) => z.url);

    childLinks.forEach((y) => y && links.push(y));
  });
  return links;
};
