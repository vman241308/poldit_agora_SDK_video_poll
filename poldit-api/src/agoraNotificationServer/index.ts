import crypto from "crypto";
import configs from "../../src/endpoints.config";
import { Request, Response } from "express-serve-static-core";
import Poll from "../models/PollModel";
import videoCompostion from "../videoCompostion";
import { IMediaChanges } from "../models/interfaces/composition";
import IPoll from "../models/interfaces/poll";

const audioChanges: IMediaChanges[] = [];
const videoChanges: IMediaChanges[] = [];

function hmacSha1(message: string): string {
  try {
    const hmac = crypto.createHmac("sha1", configs.agoraNotificationSecret);
    hmac.update(message);
    return hmac.digest("hex");
  } catch (err) {
    return "";
  }
}

export const agoraNotificationServer = async (req: Request, res: Response) => {
  const body = req.body;

  if (req.header("Agora-Signature") != hmacSha1(JSON.stringify(body))) {
    console.log("Signature is not verified.");
    res.status(200).send("Signature is not verified.");
    return;
  }
  const productId = body.productId;

  if (productId != 3) {
    // Cloud Recording
    res.status(200).send("Notification is not for Cloud Recording.");
    return;
  }

  const noticeId = body.noticeId;
  const eventType = body.eventType;
  const payload = body.payload;

  const clientSeq = payload.sequence;
  const uid = payload.uid;
  const channelName = payload.cname;

  console.log(
    `Event code: ${eventType} Uid: ${uid} Channel: ${channelName} ClientSeq: ${clientSeq}`
  );

  let response = "";

  if (payload.cname === "test") {
    response = "Recorded video stream state: " + payload.details.status;
    res.status(200).send(response);
    return;
  }

  switch (eventType) {
    case 40: // recorder_started: Cloud recording is started
      if (payload.details.msgName == "recorder_started") {
        await Poll.updateOne(
          { _id: payload.cname },
          { $set: { recordingTime: [] } }
        );
        await Poll.updateOne(
          { _id: payload.cname },
          {
            $push: {
              recordingTime: payload.sendts,
            },
          }
        );
      }
    case 41: // recorder_leave : Cloude recording leaves the channel
      if (payload.details.msgName == "recorder_leave") {
        await Poll.updateOne(
          { _id: payload.cname },
          {
            $push: {
              recordingTime: payload.sendts,
              audioChanges: audioChanges,
              videoChanges: videoChanges,
            },
          }
        );
      }
    case 43: //recorder_slice_start : service syncs the info of the recorded files (main)
      if (payload.details.msgName == "recorder_audio_stream_state_changed") {
        const tempMediaParam: IMediaChanges = {
          streamUid: payload.details.streamUid,
          state: payload.details.state,
          time: payload.details.utcMs,
        };

        audioChanges.push(tempMediaParam);
      }

    case 44:
      if (payload.details.msgName == "recorder_video_stream_state_changed") {
        const tempMediaParam: IMediaChanges = {
          streamUid: payload.details.streamUid,
          state: payload.details.state,
          time: payload.details.utcMs,
        };

        videoChanges.push(tempMediaParam);
      }

      if (payload.details.msgName == "recorder_audio_stream_state_changed") {
        const tempMediaParam: IMediaChanges = {
          streamUid: payload.details.streamUid,
          state: payload.details.state,
          time: payload.details.utcMs,
        };

        audioChanges.push(tempMediaParam);
      }

    case 31: // Recorded files are uploaded
      let fileList = JSON.stringify(payload.details!.fileList);
      await videoCompostion(channelName, fileList);
      response = "Recorded video stream state: " + payload.details.status;
      break;
    default:
      response = payload.details;
      break;
  }

  res.status(200).send(response);
};
