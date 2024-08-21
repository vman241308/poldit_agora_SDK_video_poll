import { AiOutlineOrderedList, AiOutlineUnorderedList } from "react-icons/ai";
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
import { CgImage } from "react-icons/cg";
import { HiLink } from "react-icons/hi";
import { RiHeading } from "react-icons/ri";

export const toolbarBtns = [
  {
    format: "bold",
    displayName: "Bold",
    type: "mark",
    btnIcon: <BsTypeBold size={"18px"} />,
  },
  {
    format: "italic",
    displayName: "Italic",
    type: "mark",
    btnIcon: <BsTypeItalic size={"18px"} />,
  },
  {
    format: "underline",
    displayName: "Underline",
    type: "mark",
    btnIcon: <BsTypeUnderline size={"18px"} />,
  },
  {
    format: "orderedList",
    displayName: "Ordered List",
    type: "block",
    btnIcon: <AiOutlineOrderedList size={"18px"} />,
  },
  {
    format: "bulleted-list",
    displayName: "Unordered List",
    type: "block",
    btnIcon: <AiOutlineUnorderedList size={"18px"} />,
  },
  {
    format: "media",
    displayName: "Add Image or Video",
    type: "embed",
    btnIcon: <CgImage size={"18px"} />,
  },
  // {
  //   format: "link",
  //   displayName: "Add Image or Video",
  //   type: "link",
  //   btnIcon: <HiLink size={"18px"} />,
  // },
  // {
  //   format: "strikethrough",
  //   type: "mark",
  //   btnIcon: <BsTypeStrikethrough size={"18px"} />,
  // },
  // {
  //   format: "heading",
  //   btnIcon: <RiHeading size={"18px"} />,
  // },
  // {
  //   format: "code",
  //   btnIcon: <BsCodeSlash size={"18px"} />,
  // },
];
