import {
  Box,
  Button,
  Code,
  Flex,
  Link,
  OrderedList,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Tooltip,
  UnorderedList,
  Text,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { BsLink } from "react-icons/bs";
import { MdOutlineLinkOff } from "react-icons/md";
import EditorMedia from "./customElements";

export const Element = (props: any) => {
  const { attributes, children, element } = props;

  switch (element.type) {
    case "link":
      return <LinkText {...props}>{children}</LinkText>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "orderedList":
      return (
        <OrderedList {...attributes} pl="6">
          {children}
        </OrderedList>
      );
    case "unorderedList":
      <UnorderedList {...attributes} pl="6">
        {children}
      </UnorderedList>;
    case "image":
      return <EditorMedia {...props} />;
    case "video":
      return <EditorMedia {...props} />;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const LeafElement = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.strikethrough) {
    children = (
      <span style={{ textDecoration: "line-through" }}>{children}</span>
    );
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

export const UnderlineElement = (props: any) => {
  return (
    <span
      {...props.attributes}
      style={{ fontWeight: props.leaf.underline ? "underline" : "normal" }}
    >
      {props.children}
    </span>
  );
};

export const LinkText = ({
  attributes,
  children,
  element,
  removeMedia,
}: any) => {
  return (
    <>
      <Popover placement="top-end" trigger="hover" arrowPadding={20}>
        <PopoverTrigger>
          <Link
            {...attributes}
            bg="gray.200"
            p="1"
            pl="2"
            pr="2"
            borderRadius={"md"}
            color="blue.400"
            fontWeight={"semibold"}
            href={element.url}
            isExternal
            target="_blank"
            rel="noopener noreferrer"
            aria-label="link"
          >
            {children}
          </Link>
        </PopoverTrigger>
        <Portal>
          <PopoverContent
            _focus={{ outline: "none" }}
            w="100%"
            boxShadow="0 1px 10px -1px rgba(0,0,0,.2)"
          >
            <PopoverArrow boxShadow="5px 10px 10px -1px rgba(0,0,0,.2)" />
            <PopoverBody>
              <IconButton
                aria-label="last_activity"
                title="Delete Link"
                color="poldit.100"
                icon={<MdOutlineLinkOff />}
                fontSize="20px"
                p="0"
                bg="none"
                size="xs"
                _hover={{ bg: "none" }}
                _focus={{ outline: "none" }}
                onClick={() => removeMedia(element)}
              />
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </>
  );
};
