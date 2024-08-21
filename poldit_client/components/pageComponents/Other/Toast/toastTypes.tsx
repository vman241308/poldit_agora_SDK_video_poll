import { ToastId, UseToastOptions } from "@chakra-ui/react";
import { BiErrorCircle } from "react-icons/bi";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { RiErrorWarningLine } from "react-icons/ri";
import { IUserPresence } from "_components/hooks/channel/useChannel";

import CustomToast from ".";
import MediaToast from "./MediaToast";

type Toast = (options?: UseToastOptions | undefined) => ToastId | undefined;

type ToastPosition =
  | "top"
  | "top-right"
  | "top-left"
  | "bottom"
  | "bottom-right"
  | "bottom-left";

type ToastInfo = {
  msg: string;
  id: string;
  duration: number;
  position: ToastPosition;
  iconSize: string;
  noId?: boolean;
};

interface TMediaToastInfo {
  duration: number;
  msg: string;
  position: ToastPosition;
  noId?: boolean;
  user: IUserPresence;
}

type TMsgType = "success" | "error" | "warning";

export const getMediaToasts = (
  toast: Toast,
  msgType: TMsgType,
  details: TMediaToastInfo
) => {
  if (details.noId) {
    toast({
      duration: details.duration,
      position: details.position,
      render: () => (
        <MediaToast msg={details.msg} data={{ creator: details.user }} />
      ),
    });
  } else {
    toast({
      id: details.user.uid,
      duration: details.duration,
      position: details.position,
      render: () => (
        <MediaToast msg={details.msg} data={{ creator: details.user }} />
      ),
    });
  }

  return null;
};

export const getToasts = (
  toast: Toast,
  msgType: TMsgType,
  details: ToastInfo
) => {
  if (details.noId) {
    toast({
      duration: details.duration,
      position: details.position,
      render: () => (
        <CustomToast
          msg={details.msg}
          bg={getBgColor(msgType)}
          fontColor={"white"}
          iconSize={details.iconSize}
          Icon={getToastIcon(msgType)}
        />
      ),
    });
  } else {
    toast({
      id: details.id,
      duration: details.duration,
      position: details.position,
      render: () => (
        <CustomToast
          msg={details.msg}
          bg={getBgColor(msgType)}
          fontColor={"white"}
          iconSize={details.iconSize}
          Icon={getToastIcon(msgType)}
        />
      ),
    });
  }

  return null;
};

const getBgColor = (msgType: TMsgType) => {
  switch (msgType) {
    case "success":
      return "green.300";
    case "warning":
      return "yellow.400";
    default:
      return "red.300";
  }
};

const getToastIcon = (msgType: TMsgType) => {
  switch (msgType) {
    case "success":
      return IoCheckmarkCircleOutline;
    case "warning":
      return RiErrorWarningLine;
    default:
      return BiErrorCircle;
  }
};
