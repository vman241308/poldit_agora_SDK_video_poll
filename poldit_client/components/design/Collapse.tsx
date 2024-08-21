import { Box, useDisclosure, Button, Text, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Descendant, Node } from "slate";
import { CustomEditor } from "_components/pageComponents/Editor/functions";
import {
  getLinks,
  RichTxtCard,
  RickTxtContainer,
} from "_components/pageComponents/Editor/richTxtOut";
import CustomLink from "_components/pageComponents/Other/Media/LinkOverlay";

const CollapseCtr = (props: RickTxtContainer) => {
  const TXT_MAX = 200;
  // const { isOpen, onToggle } = useDisclosure();
  const { contentCount, mediaCount } = CustomEditor.getContentLength(
    props.nodes as Descendant[]
  );

  const links = getLinks(props.nodes);

  const previewHover =
    props.contentType === "Poll Preview"
      ? { color: "gray.300", fontWeight: "semibold", cursor: "pointer" }
      : {};

  const NewNodes = () => {
    const textNodes = (props.nodes as Descendant[]).filter(
      (node: any) => node.type === "paragraph"
    );

    const plainTxt = CustomEditor.getPlainText(textNodes);
    const newNode = CustomEditor.createParagraph(
      plainTxt[0].slice(0, TXT_MAX) + "..."
    ) as Node;
    return (
      <Box>
        <Box onClick={props.goToPoll} _hover={previewHover}>
          <RichTxtCard
            node={newNode}
            showFull={false}
            txtStyle={props.txtStyle ?? ""}
            addShow={true}
            pollId={props.pollId}
          />
        </Box>
        <Text
          {...props.txtStyle}
          mt="3"
          color="blue.400"
          fontWeight={"semibold"}
          onClick={props.toggleShow}
          cursor={"pointer"}
        >
          Show More
        </Text>
      </Box>
    );
  };

  return (
    <Box fontSize={props.fontSize ?? ["xs", "sm", "sm", "md"]}>
      {contentCount < TXT_MAX && mediaCount === 0 ? (
        <Box onClick={props.goToPoll} _hover={previewHover}>
          {props.nodes.map((x, idx) => (
            <RichTxtCard
              key={idx}
              node={x}
              showFull={false}
              txtStyle={props.txtStyle ?? ""}
            />
          ))}
        </Box>
      ) : (
        <>
          {!props.show && props.nodes ? (
            <>
              <NewNodes />
            </>
          ) : (
            <>
              <Box onClick={props.goToPoll} _hover={previewHover}>
                {props.nodes.map((x, idx) => (
                  <RichTxtCard
                    key={idx}
                    node={x}
                    showFull={true}
                    txtStyle={props.txtStyle ?? ""}
                  />
                ))}
              </Box>
              {links.length > 0 && !props.show && (
                <Flex justifyContent={"center"} mt="3" mb="3">
                  <CustomLink link={links[links.length - 1]} />
                </Flex>
              )}
              <Text
                {...props.txtStyle}
                mt="3"
                color="blue.400"
                fontWeight={"semibold"}
                onClick={props.toggleShow}
                cursor={"pointer"}
              >
                Show Less
              </Text>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default CollapseCtr;
