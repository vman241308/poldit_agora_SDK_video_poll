import { Link, Image } from "@chakra-ui/react";
import { CompositeDecorator, ContentBlock, ContentState } from "draft-js";
// import { LINK_REGEX } from "_components/globalFuncs";
// const HASHTAG_REGEX = /#[\w\u0590-\u05ff]+/g;

export const createLinkDecorator = () =>
  new CompositeDecorator([
    {
      strategy: LinkStrategy,
      component: LinkText,
    },
  ]);

const LinkStrategy = function (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) {
  //Different approach.  This looks for LINK entities that are set in editor
  contentBlock.findEntityRanges((chr) => {
    const entityKey = chr.getEntity();

    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === "LINK"
    );
  }, callback);
  // const text = contentBlock.getText();

  // let matchArr, start;
  // while ((matchArr = LINK_REGEX.exec(text)) !== null) {
  //   start = matchArr.index;
  //   callback(start, start + matchArr[0].length);
  // }
};

const LinkText = (props: any) => {
  return (
    <Link
      color="blue.400"
      fontWeight={"semibold"}
      href={props.decoratedText}
      isExternal
      target="_blank"
      rel="noopener noreferrer"
      aria-label={props.decoratedText}
    >
      {props.children}
    </Link>
  );
};
