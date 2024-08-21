import { Box, Image } from "@chakra-ui/react";
import { PhotoConsumer } from "react-photo-view";
import Video from "./Video";

interface MediaObj {
  type: "video" | "image";
  alt: string;
  url: string;
  width: string;
  height: string;
  children: any[];
}

interface MediaPreview {
  media: string;
}

const MediaPreview = ({ media }: MediaPreview) => {
  let pollMedia: MediaObj | string;

  if (media.startsWith('{"type":')) {
    pollMedia = JSON.parse(media);
  } else {
    pollMedia = media;
  }

  const mediaUrl = typeof pollMedia === "string" ? pollMedia : pollMedia.url;

  if (typeof pollMedia === "object" && pollMedia.type === "video") {
    return (
      <Box w="100px" h="100px" mr="2" borderRadius="md" overflow="hidden">
        <Video url={pollMedia.url} styles={{ light: true }} />
      </Box>
    );
  }

  return (
    <Box w="100px" h="100px" mr="2" borderRadius="md" overflow="hidden">
      {typeof pollMedia === "object" && pollMedia.type === "video" ? (
        <Video url={pollMedia.url} styles={{ light: true, height: "150px" }} />
      ) : (
        <Image
          src={typeof pollMedia === "string" ? pollMedia : pollMedia.url}
          title="Image"
          objectFit="cover"
          objectPosition="center center"
          h="100%"
          w="100%"
        />
      )}
    </Box>
  );
};

export default MediaPreview;
