import { ContentBlock } from "draft-js";
import { Flex, Image } from "@chakra-ui/react";
import CustomLink from "../../Media/LinkOverlay";
import Video from "../../Media/Video";

export const CustomMediaRender = (block: ContentBlock) => {
  if (block.getType() === "atomic") {
    return { component: CustomMedia, editable: false };
  }
  return null;
};

const CustomMedia = (props: any) => {
  const entity = props.contentState.getEntity(props.block.getEntityAt(0));
  const { src } = entity.getData();
  const type = entity.getType();
  let media;

  if (type === "IMAGE") {
    media = <CustomImg src={src} />;
  }

  if (type === "LINK") {
    media = <PreviewLink src={src} />;
  }

  if (type === "VIDEO") {
    media = <CustomVideo src={src} />;
  }

  return media;
};

const CustomVideo = ({ src }: any) => {
  return (
    <Flex justifyContent={"center"} w="100%" height="300px">
      <Video url={src} />
    </Flex>
  );
};

const CustomImg = ({ src }: { src: string }) => (
  <Flex justifyContent={"center"}>
    <Image
      src={src}
      whiteSpace={"initial"}
      height="300px"
      width={"auto"}
      objectFit={"contain"}
      rounded="md"
    />
  </Flex>
);

const PreviewLink = ({ src }: { src: string }) => {
  const closeHandler = () => console.log(src);

  return (
    <Flex justifyContent={"center"} p="2" m="3">
      <CustomLink link={src} close={closeHandler} />
    </Flex>
  );
};
