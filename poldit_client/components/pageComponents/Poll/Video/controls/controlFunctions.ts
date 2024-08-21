import { IUserPresence } from "_components/hooks/channel/useChannel";

type THandleNavControlMessages = (
  mssg: string,
  member: IUserPresence
) => { channelMssg: string; updatedMember: IUserPresence };

const handleNavControlMessages: THandleNavControlMessages = (
  channelMssg,
  member
) => {
  let user = member;
  let mssg = channelMssg;

  switch (channelMssg) {
    case "video":
      user = {
        ...member,
        isScreenSharing:false,
        showCam: !member.showCam,
        muteMic: true,
      };
      break;
    case "screen":
      user = {
        ...member,
        isScreenSharing: !member.isScreenSharing,
        showCam: false,
        muteMic: true,
      };
      break;
    case "audio":
      user = {
        ...member,
        muteMic: !member.muteMic,
      };
      break;
    case "Leave Stream":
      user = {
        ...member,
        isStreaming: false,
        showCam: false,
        muteMic: false,
        isScreenSharing: false,
        onPanel: false,
      };
      break;
    default:
      break;
  }
  // switch (channelMssg) {
  //   case "Host Camera":
  //     if (!member.isStreaming) {
  //       user = {
  //         ...member,
  //         isStreaming: true,
  //         showCam: true,
  //         muteMic: true,
  //         isScreenSharing: false,
  //       };
  //       mssg = "Start Stream";
  //     } else {
  //       user = {
  //         ...member,
  //         showCam: !member.showCam,
  //       };
  //     }
  //     break;
  //   case "Leave Stream":
  //     user = {
  //       ...member,
  //       isStreaming: false,
  //       showCam: false,
  //       muteMic: false,
  //       isScreenSharing: false,
  //       onPanel: false,
  //     };
  //     break;
  //   case "Share Screen":
  //     user = {
  //       ...member,
  //       muteMic: true,
  //       isScreenSharing: !member.isScreenSharing,
  //       isStreaming: false,
  //       showCam: false,
  //     };
  //     break;
  //   case "Host Mic":
  //     if (!member.isStreaming) {
  //       user = {
  //         ...member,
  //         isStreaming: true,
  //         showCam: false,
  //         muteMic: true,
  //         isScreenSharing: false,
  //       };
  //       mssg = "Start Stream";
  //     } else {
  //       user = {
  //         ...member,
  //         muteMic: !member.muteMic,
  //       };
  //     }

  //     break;
  // }

  return { channelMssg: mssg, updatedMember: user };
};

export default handleNavControlMessages;
