import { Box, Flex, Image, Center, CloseButton } from "@chakra-ui/react";
import { useFocused, useSelected } from "slate-react";
import Video from "../Other/Media/Video";

const EditorMedia = ({ attributes, children, element, removeMedia }: any) => {
  const { url, width, height } = element;
  const selected = useSelected();
  const focused = useFocused();

  return (
    <Flex
      {...attributes}
      justifyContent="center"
      boxShadow={selected && focused && "0 0 3px 3px lightgray"}
    >
      <Center
        userSelect={"none"}
        contentEditable={false}
        flexDir="column"
        w={width}
        h={height}
        overflow={"hidden"}
        bg="black"
        position={"relative"}
      >
        {element.type === "image" ? (
          <Image
            alt={element.alt}
            src={url}
            objectFit={"contain"}
            maxW="100%"
            maxH="100%"
            zIndex={0}
          />
        ) : (
          <Video url={url} styles={{ height: "80%" }} />
        )}
        {removeMedia && (
          <CloseButton
            position={"absolute"}
            _active={{ outline: "none" }}
            _focus={{ outline: "none" }}
            bg="gray.200"
            right="2"
            size="sm"
            top="2"
            zIndex={5}
            _hover={{ bg: "gray.300" }}
            onClick={() => removeMedia(element)}
          />
        )}
      </Center>
    </Flex>
  );
};

export default EditorMedia;
