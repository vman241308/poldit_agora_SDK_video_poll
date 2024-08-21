import { Box, HStack, IconButton, Text } from "@chakra-ui/react";
import { useState } from "react";
import {
  BsFillCameraVideoFill,
  BsFillCameraVideoOffFill,
  BsFillMicFill,
  BsFillMicMuteFill,
  BsRecordBtn,
} from "react-icons/bs";
import { IoMdExit } from "react-icons/io";
import { MdOutlineScreenShare, MdOutlineStopScreenShare } from "react-icons/md";
import {
  IStreamIndicators,
  IUserPresence,
  TPublishToChannel,
} from "_components/hooks/channel/useChannel";

interface IPanelVideoControls {
  btnStyles: any;
  member: IUserPresence;
  updatePanel: TPublishToChannel;
  btnStates: IStreamIndicators;
  isHost: boolean;
}

const PanelVideoControls = (props: IPanelVideoControls) => {
  return (
    <HStack spacing="5">
      <AudioBtn {...props} />
      <CameraBtn {...props} />
      <ScreenShareBtn {...props} />
      <LeaveBtn {...props} />
      {props.isHost && <RecordBtn {...props} />}
    </HStack>
  );
};

export default PanelVideoControls;

const AudioBtn = (props: IPanelVideoControls) => {
  return (
    <Box>
      <IconButton
        {...props.btnStyles}
        aria-label={"micMute"}
        isLoading={props.btnStates.audioLoading}
        color={props.member.muteMic ? "white" : "red.400"}
        isDisabled={props.isHost ? undefined : props.member.modMuteMic}
        onClick={() =>
          props.btnStates.handleAudio({
            ...props.member,
            muteMic: !props.member.muteMic,
            isStreaming: true,
          })
        }
        icon={props.member.muteMic ? <BsFillMicFill /> : <BsFillMicMuteFill />}
      />
      <Text>{`${props.member.muteMic ? "Mute" : "Unmute"}`}</Text>
    </Box>
  );
};

const CameraBtn = (props: IPanelVideoControls) => {
  return (
    <Box>
      <IconButton
        {...props.btnStyles}
        aria-label={"videoMute"}
        onClick={() =>
          props.btnStates.handleVideoCamera({
            ...props.member,
            showCam: !props.member.showCam,
            isStreaming: true,
          })
        }
        isLoading={props.btnStates.videoLoading}
        isDisabled={props.isHost ? undefined : props.member.modMuteCam}
        icon={
          props.member.showCam ? (
            <BsFillCameraVideoFill />
          ) : (
            <BsFillCameraVideoOffFill />
          )
        }
        color={props.member.showCam ? "white" : "red.400"}
      />
      <Text>{`${props.member.showCam ? "Stop Video" : "Share Video"}`}</Text>
    </Box>
  );
};

const ScreenShareBtn = (props: IPanelVideoControls) => {
  return (
    <Box>
      <IconButton
        {...props.btnStyles}
        aria-label={"screenShare"}
        isLoading={props.btnStates.screenLoading}
        isDisabled={props.isHost ? undefined : props.member.modMuteCam}
        icon={
          props.member.isScreenSharing ? (
            <MdOutlineScreenShare />
          ) : (
            <MdOutlineStopScreenShare />
          )
        }
        color={props.member.isScreenSharing ? "white" : "red.400"}
        onClick={() =>
          props.btnStates.handleScreenShare({
            ...props.member,
            isScreenSharing: !props.member.isScreenSharing,
            isStreaming: true,
            muteMic: true,
          })
        }
      />
      <Text>{`${
        props.member.isScreenSharing ? "Stop Screen Share" : "Share Screen"
      }`}</Text>
    </Box>
  );
};

const LeaveBtn = ({ member, btnStyles, updatePanel }: IPanelVideoControls) => {
  return (
    <Box>
      <IconButton
        {...btnStyles}
        aria-label={"leaveVideo"}
        icon={<IoMdExit />}
        onClick={() =>
          updatePanel("Leave Stream", {
            ...member,
            isStreaming: false,
            showCam: false,
            muteMic: false,
            isScreenSharing: false,
            onPanel: false,
          })
        }
        // onClick={() => handlePanelUpdates("Leave Stream")}
      />
      <Text>Leave Panel</Text>
    </Box>
  );
};

const RecordBtn = (props: IPanelVideoControls) => {
  return (
    <Box>
      <IconButton
        {...props.btnStyles}
        aria-label={"recordBtn"}
        icon={<BsRecordBtn />}
        onClick={() => props.btnStates.handleRecording(props.member)}
        color={props.btnStates.record ? "white" : "red.400"}
      />
      <Text>{props.btnStates.record ? "Stop Recording" : "Record"}</Text>
    </Box>
  );
};
