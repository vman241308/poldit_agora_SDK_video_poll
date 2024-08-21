import { ContentBlock } from "draft-js";
import { AiOutlineUnorderedList, AiOutlineOrderedList } from "react-icons/ai";
import { BiCodeCurly, BiAlignLeft, BiAlignRight } from "react-icons/bi";
import {
  BsTypeBold,
  BsTypeItalic,
  BsTypeUnderline,
  BsTypeStrikethrough,
  BsCodeSlash,
  BsBlockquoteLeft,
  BsTextCenter,
  BsLink45Deg,
} from "react-icons/bs";

import styles from "../editor.module.css";

const inlineStyles = [
  {
    label: "bold",
    style: "BOLD",
    icon: <BsTypeBold size={"18px"} />,
  },
  {
    label: "italic",
    style: "ITALIC",
    icon: <BsTypeItalic size={"18px"} />,
  },
  {
    label: "underline",
    style: "UNDERLINE",
    icon: <BsTypeUnderline size={"18px"} />,
  },
  // {
  //   label: "strikethrough",
  //   style: "STRIKETHROUGH",
  //   icon: <BsTypeStrikethrough size={"18px"} />,
  // },
  // {
  //   label: "code",
  //   style: "CODE",
  //   icon: <BsCodeSlash size={"18px"} />,
  // },
];

const blockTypes = [
  { label: "Normal", style: "header-one" },
  { label: "H1", style: "header-one" },
  { label: "H2", style: "header-two" },
  {
    label: "Block quote",
    style: "blockquote",
    icon: <BsBlockquoteLeft size={"18px"} />,
  },
  {
    label: "Unordered List",
    style: "unordered-list-item",
    icon: <AiOutlineUnorderedList size={"18px"} />,
  },
  {
    label: "Ordered List",
    style: "ordered-list-item",
    icon: <AiOutlineOrderedList size={"18px"} />,
  },
  {
    label: "Code Block",
    style: "code-block",
    icon: <BiCodeCurly size={"18px"} />,
  },
  {
    label: "Align Left",
    style: "alignleft",
    icon: <BiAlignLeft size={"18px"} />,
  },
  {
    label: "Align Center",
    style: "aligncenter",
    icon: <BsTextCenter size={"18px"} />,
  },
  {
    label: "Align Right",
    style: "alignright",
    icon: <BiAlignRight size={"18px"} />,
  },
];

const customBlockTylesFn = (contentBlock: ContentBlock) => {
  const type = contentBlock.getType();

  if (type === "code-block") {
    return styles.codeBlockStyle;
  }
};

export { inlineStyles, blockTypes, customBlockTylesFn };
