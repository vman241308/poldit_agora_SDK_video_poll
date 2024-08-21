import { Types } from "ably";
import { IUserPresence } from "_components/hooks/channel/useChannel";
import { IUserVideoRTCReturn } from "_components/hooks/useVideoRTC";


type TStartPoll = (panelMembers: IUserPresence[]) => void;
type TRemoveFromPanel = (vals: IUserPresence[]) => void;

type TGetChannelHistory = (
  channel: Types.RealtimeChannelCallbacks,
  hostAppid: string,
  startPoll: TStartPoll,
  liveStream: IUserVideoRTCReturn,
  pollId: string
) => void;

type TLeavePoll = (
  stream: IUserVideoRTCReturn,
  leave: TRemoveFromPanel
) => void;

type TUpdateMembers = (
  channel: Types.RealtimeChannelCallbacks,
  user: IUserPresence,
  key: string,
  value: boolean
) => void;

export const enterPoll: TGetChannelHistory = (
  channel,
  hostAppid,
  startPoll,
  liveStream,
  pollId
) => {
  channel.presence.get(async (err, members) => {
    const host = members?.find((x) => x.data.uid === hostAppid);
    if (host && host.data.pollStarted) {
      const panelists = members
        ?.map((x) => x.data)
        .filter((y: IUserPresence) => y.onPanel);
      panelists && startPoll(panelists);
      // startPoll(host.data);
      // await liveStream.joinStreamInprogress(host.data, pollId, false);
    }
  });
  //   channel.presence.history((err, resPage) => {
  //     resPage
  //       ?.current()
  //       .then(async (res) => {
  //         const last_host_presence = getMemberLastPresenceMssg(
  //           hostAppid,
  //           "update",
  //           res
  //         );

  //         if (last_host_presence) {
  //             console.log(last_host_presence)
  //           startPoll(last_host_presence.data);
  //           await liveStream.startStream(last_host_presence.data, pollId, false);
  //         }
  //       })
  //       .catch((err) => console.log(err));
  //   });
};

const getMemberLastPresenceMssg = (
  member: string,
  action: "enter" | "leave" | "update",
  data: Types.PaginatedResult<Types.PresenceMessage>
) => {
  return data.items.find(
    (x) =>
      x.action === "update" && x.data.appid === member && x.data.pollStarted
  );
};

export const leavePoll: TLeavePoll = (stream, leave) => {
  const { leaveChannel, leaveStream } = stream;
  leaveStream();
  leaveChannel();
  leave([]);
  console.log("User left Poll");
};

export const updatePresenceMembers: TUpdateMembers = (
  channel,
  user,
  key,
  value
) => {
  channel.presence.get(async (err, members) => {
    const panel = members?.filter(
      ({ data }: { data: IUserPresence }) => data.onPanel
    );

    if (panel && panel.length > 0) {
      panel?.forEach(({ data }: { data: IUserPresence }) => {
        if (data.onPanel) {
          data.uid !== user.uid &&
            channel.presence.update({ ...data, [key]: value });
        }
      });
    }
    // members?.forEach(({ data }: { data: IUserPresence }) => {
    //   if (data.onPanel) {
    //     data.uid !== user.uid &&
    //       channel.presence.update({ ...data, [key]: value });
    //   }
    // });
    // const host = members?.find((x) => x.data.uid === hostAppid);
    // if (host && host.data.pollStarted) {
    //   const panelists = members
    //     ?.map((x) => x.data)
    //     .filter((y: IUserPresence) => y.onPanel);
    //   panelists && startPoll(panelists);
    // startPoll(host.data);
    // await liveStream.joinStreamInprogress(host.data, pollId, false);
  });
};
