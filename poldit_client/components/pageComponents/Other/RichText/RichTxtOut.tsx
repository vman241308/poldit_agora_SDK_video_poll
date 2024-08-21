import DOMPurify from "dompurify";
import { Box, Flex, Collapse, Text, Tooltip } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { convertFromRaw, RawDraftContentState } from "draft-js";

import { useRouter } from "next/router";
import { parseIntoRichTxt } from "./richTxtFuncs";
import { CSSProperties, HTMLAttributes } from "react";
import Video from "../Media/Video";
import RickTxtContainer from "_components/pageComponents/Editor/richTxtOut";

const CustomLink = dynamic(() => import("../Media/LinkOverlay"));

interface CustomRichTxt {
  contentType: string;
  content: string;
  link?: string;
  show?: boolean;
  cardToggle?: () => void;
  cardStyle?: CSSProperties | undefined;
  pollId?: string;
  fontSize?: any;
  txtStyle?: any;
}

const RichTxtOut = ({
  contentType,
  content,
  link,
  show,
  cardToggle,
  cardStyle,
  pollId,
  fontSize,
  txtStyle,
}: CustomRichTxt) => {
  const router = useRouter();

  const goToPoll = () => {
    if (link) {
      router.push(link);
    }
  };

  let questionContent: any = "";
  let questionTxt = "";
  let previewLink = "";
  let videos: string[] = [];
  let hasRichContent = false;

  if (content.startsWith('[{"type":')) {
    const nodes = JSON.parse(content);

    return (
      <RickTxtContainer
        nodes={nodes}
        pollId={pollId}
        toggleShow={cardToggle}
        goToPoll={goToPoll}
        contentType={contentType}
        show={show}
        fontSize={fontSize}
        txtStyle={txtStyle}
      />
    );
  }

  if (content.search('"blocks":') > -1) {
    const questionRawContent: RawDraftContentState = JSON.parse(content);
    hasRichContent = Object.keys(questionRawContent.entityMap).length > 0;
    previewLink = getLastLinkForPreview(questionRawContent);
    videos = getVideos(questionRawContent);
    const questionContentState = convertFromRaw(questionRawContent);
    questionTxt = questionContentState.getPlainText();
    const questionHTML = parseIntoRichTxt(questionContentState, contentType);

    DOMPurify.addHook("afterSanitizeAttributes", function (node) {
      // set all elements owning target to target=_blank
      if ("target" in node) {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener");
      }
    });

    questionContent = { __html: DOMPurify.sanitize(questionHTML) };
  }
  // else if (/<[^>]+>/.test(content)) {
  //   DOMPurify.addHook("afterSanitizeAttributes", function (node) {
  //     // set all elements owning target to target=_blank
  //     if ("target" in node) {
  //       node.setAttribute("target", "_blank");
  //       node.setAttribute("rel", "noopener");
  //     }
  //   });
  //   questionContent = { __html: DOMPurify.sanitize(content) };
  // }
  else {
    questionContent = content;
  }

  return (
    <CollapseCard
      contentType={contentType}
      data={questionContent}
      questionTxt={questionTxt}
      prevLink={previewLink}
      goToPoll={goToPoll}
      show={show}
      cardToggle={cardToggle}
      cardStyle={cardStyle}
      hasRichContent={hasRichContent}
      pollId={pollId ?? ""}
      videos={videos}
    />
  );
};

export default RichTxtOut;

const CollapseCard = ({
  contentType,
  data,
  questionTxt,
  prevLink,
  goToPoll,
  show,
  cardToggle,
  cardStyle,
  hasRichContent,
  pollId,
  videos,
}: any) => {
  const dataLength =
    typeof data === "object" ? data.__html.length : data.length;

  const previewHover =
    contentType === "Poll Preview"
      ? { color: "gray.500", fontWeight: "semibold" }
      : {};

  return (
    <Box pt={5} pb={2} pl="25px" pr="25px">
      {!show && (
        <Box onClick={goToPoll}>
          <Text
            id={`poll_${pollId}`}
            {...cardStyle}
            fontSize={["xs", "xs", "sm", "md"]}
            // ml="3"
            transition="fontWeight 2s"
            color="gray.500"
            cursor={contentType === "Poll Preview" ? "pointer" : ""}
            _hover={previewHover}
            noOfLines={3}
          >
            {questionTxt ? questionTxt : data}
          </Text>
        </Box>
      )}
      <Collapse in={show} animateOpacity>
        {typeof data === "object" ? (
          <>
            <Box
              dangerouslySetInnerHTML={data}
              onClick={() => goToPoll()}
              fontSize={["sm", "sm", "md"]}
              color="gray.500"
              _hover={previewHover}
              cursor={contentType === "Poll Preview" ? "pointer" : ""}
            />
            {videos.length > 0 &&
              videos.map((x: string, idx: number) => (
                <Flex
                  key={idx}
                  justifyContent={"center"}
                  w="100%"
                  height="300px"
                  mb="2"
                >
                  <Video url={x} />
                </Flex>
              ))}
            {prevLink && (
              <Flex justifyContent={"center"} mt="5">
                <CustomLink link={prevLink} />
              </Flex>
            )}
          </>
        ) : (
          <Box
            fontSize={["xs", "xs", "sm", "md"]}
            color="gray.800"
            cursor={contentType === "Poll Preview" ? "pointer" : ""}
            _hover={previewHover}
            whiteSpace="pre-wrap"
          >
            {data}
          </Box>
        )}
      </Collapse>
      {(dataLength > 220 || hasRichContent) && (
        <Text
          {...cardStyle}
          onClick={cardToggle}
          fontSize="sm"
          cursor="pointer"
          fontWeight={"semibold"}
          color="blue.500"
          mt="3"
          // pl="10px"
        >
          {show ? "Show less" : "Show more"}
        </Text>
      )}
    </Box>
  );
};

const getLastLinkForPreview = (content: RawDraftContentState) => {
  const { entityMap } = content;
  const keys = Object.keys(entityMap);

  let finalList: string[] = [];

  if (keys.length > 0) {
    for (const key in entityMap) {
      const element = entityMap[key];
      if (element.type === "LINK" && !finalList.includes(element.data.url)) {
        finalList.push(element.data.url);
      }
    }
    return finalList[finalList.length - 1];
  }
  return "";
};

const getVideos = (content: RawDraftContentState) => {
  const { entityMap } = content;
  const keys = Object.keys(entityMap);

  let finalList: string[] = [];

  if (keys.length > 0) {
    for (const key in entityMap) {
      const element = entityMap[key];
      if (element.type === "VIDEO" && !finalList.includes(element.data.src)) {
        finalList.push(element.data.src);
      }
    }
    return finalList;
  }
  return [];
};
