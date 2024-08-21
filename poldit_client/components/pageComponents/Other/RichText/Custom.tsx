import { Box, Flex, Image, IconButton } from "@chakra-ui/react";
import { ContentState, SelectionState } from "draft-js";
import { ContentBlock } from "react-draft-wysiwyg";
import { IoCloseSharp } from "react-icons/io5";
import Video from "../Media/Video";

export const CustomMediaRender = (block: ContentBlock, removeImg: any) => {
  if (block.getType() === "atomic") {
    return { component: CustomMedia, editable: false, props: { removeImg } };
  }
  return null;
};

interface CustomComponent {
  contentState: ContentState;
  block: ContentBlock;
  blockProps: { removeMedia: () => void; selectionState: SelectionState };
}

export const CustomMedia = ({
  contentState,
  block,
  blockProps,
}: CustomComponent) => {
  // export const CustomMedia = (props: any) => {
  // const { contentState, block, blockProps } = props;
  const entity = contentState.getEntity(block.getEntityAt(0));

  const { src, alt } = entity.getData();
  const type = entity.getType();

  let media;

  if (type === "IMAGE") {
    media = (
      <CustomImg
        src={src}
        alt={alt}
        contentState={contentState}
        block={block}
        blockProps={blockProps}
        // remove={blockProps.removeMedia}
      />
    );
  }

  if (type === "VIDEO") {
    media = (
      <CustomVideo
        src={src}
        alt={alt}
        contentState={contentState}
        block={block}
        blockProps={blockProps}
        // remove={blockProps.removeMedia}
      />
    );
  }

  return media;
};

const CustomVideo = ({ src, alt, contentState, block, blockProps }: any) => {
  return (
    <Flex justifyContent={"center"}>
      <Video url={src} />
    </Flex>
  );
};

const CustomImg = ({ src, alt, contentState, block, blockProps }: any) => {
  const { removeMedia, selectionState } = blockProps;

  return (
    <Flex justifyContent={"center"}>
      {/* <Box position="relative"> */}
        {/* <IconButton
          aria-label="close-image"
          position="absolute"
          right="0"
          color="poldit.100"
          margin={"2"}
          size="sm"
          icon={<IoCloseSharp size="18px" />}
          onMouseDown={(e) =>
            removeMedia(e, contentState, block, selectionState)
          }
          // onClick={() => removeMedia(contentState, blockKey)}
        /> */}
        <Image
          src={src}
          height="100%"
          // boxSize="250px"
          objectFit={"contain"}
          alt={alt}
          rounded="md"
        />
      {/* </Box> */}
    </Flex>
  );
};
