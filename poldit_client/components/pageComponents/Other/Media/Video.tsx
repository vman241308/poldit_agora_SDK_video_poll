import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import videoStyles from "./styles.module.css";

interface Video {
  url: string;
  setIsValidVideo?: (validUrl: boolean) => void;
  styles?: any;
}

const Video = ({ url, setIsValidVideo, styles }: Video) => {
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [exclude, setExclude] = useState(false);

  useEffect(() => {
    setIsValidVideo && setIsValidVideo(ReactPlayer.canPlay(url));

    if (url.search("tiktok") > -1) {
      setIsValidUrl(true);
      setExclude(true);
      return;
    }

    setIsValidUrl(ReactPlayer.canPlay(url));
    setExclude(false);
  }, [url]);

  return (
    <Box
      height={styles?.height ?? "100%"}
      overflow={"hidden"}
      w={styles?.width ?? "100%"}
      // maxW={"500px"}
      position="relative"
      zIndex={0}
    >
      {isValidUrl && !exclude && (
        <ReactPlayer
          url={url}
          height="100%"
          width={"100%"}
          controls={styles?.light ? false : true}
          light={styles?.light ? true : false}
          volume={1}
          muted={styles?.light ? true : false}
        />
      )}
      {isValidUrl && exclude && (
        <Box className={videoStyles["video-container"]}>
          <video
            src={url}
            className={videoStyles["video-player"]}
            style={{ width: url.search("tiktok") > -1 ? "50%" : "100%" }}
            controls
          />
        </Box>
      )}
    </Box>
  );
};

export default Video;
