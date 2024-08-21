import {
  Box,
  HStack,
  IconButton,
  Tag,
  TagLabel,
  Tooltip,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { HiVolumeOff, HiVolumeUp } from "react-icons/hi";
import { RiFullscreenExitLine, RiFullscreenLine } from "react-icons/ri";
import { IUserPresence } from "_components/hooks/channel/useChannel";
import controlFunctions from "./controls";
import styles from "./video.module.css";

interface IVideoControlProps {
  player: HTMLElement;
  data: IUserPresence;
  isHost: boolean;
}

const VideoControls = (props: IVideoControlProps) => {
  const [isFull, setIsFull] = useState(false);
  // const [mute, setMute] = useState(false);

  const handleFullScreen = () => {
    controlFunctions.toggleFullscreen(props.player);
    setIsFull(!isFull);
  };

  return (
    <Box
      className={`${styles.controls}`}
      bg={props.data.isStreaming ? "blackAlpha.700" : "none"}
      pl="1"
      pt="0.5"
      // p="1"
      // pl="2"
      // pr="2"
      // pt="1"
    >
      <HStack>
        <Tag
          bg={props.data.isMod ? "poldit.100" : "green.400"}
          variant={"solid"}
          size="sm"
          fontSize={"xs"}
        >
          {props.data.isMod ? "Host" : "Panel"}
          {/* <TagLabel>{props.data.isMod ? "Host" : "Panel"}</TagLabel> */}
        </Tag>
        {!props.isHost && props.data.isScreenSharing && (
          <Tag bg={"blue.400"} variant={"solid"} size="sm" fontSize={"xs"}>
            Sharing Screen
          </Tag>
        )}
      </HStack>
      {props.data.isStreaming && (
        <HStack>
          {!props.data.muteMic && (
            <Tooltip
              label="Panelist Muted"
              // label={mute ? "Unmute Panelist" : "Mute Panelist"}
              placement="top-start"
              width="70%"
              textAlign={"center"}
              rounded={"md"}
              hasArrow
            >
              <IconButton
                aria-label={"muteBtn"}
                p="0"
                variant="ghost"
                _hover={{ bg: "none" }}
                _focus={{ outline: "none" }}
                onClick={() => console.log("triggered")}
                rounded="md"
                size="sm"
                fontSize={"lg"}
                icon={<HiVolumeOff />}
                // icon={mute ? <HiVolumeUp /> : <HiVolumeOff />}
              />
            </Tooltip>
          )}

          <Tooltip
            label={isFull ? "Exit Full Screen" : "Full Screen"}
            placement="top-start"
            hasArrow
            rounded={"md"}
          >
            <IconButton
              aria-label={"minMaxBtn"}
              p="0"
              variant="ghost"
              fontSize={"lg"}
              size="sm"
              _hover={{ bg: "none" }}
              _focus={{ outline: "none" }}
              onClick={handleFullScreen}
              rounded="md"
              icon={isFull ? <RiFullscreenExitLine /> : <RiFullscreenLine />}
            />
          </Tooltip>
        </HStack>
      )}
    </Box>
  );
};

export default VideoControls;
