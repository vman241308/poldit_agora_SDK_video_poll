import axios from "axios";
import configs from "../../endpoints.config";

const encodedCredential = `Basic ${Buffer.from(
  configs.agoraCustomerCredential
).toString("base64")}`;

export const getAgoraResource = async (channelId: string) => {
  try {
    const resource = await axios.post(
      `https://api.agora.io/v1/apps/${configs.agoraAppId}/cloud_recording/acquire`,
      {
        cname: channelId,
        uid: "1234",
        clientRequest: { resourceExpiredHour: 24 },
      },
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: encodedCredential,
        },
      }
    );

    return resource?.data.resourceId;
  } catch (err) {
    throw err;
  }
};

export const startCloudRecording = async (
  resourceId: string,
  userId: string,
  channelId: string,
  token: string
) => {
  const storageConfig = {
    ...configs.storageOptions,
    fileNamePrefix: ["videoPolls", userId, channelId],
  };

  const payload = {
    cname: channelId,
    uid: "1234",
    clientRequest: {
      token,
      recordingConfig: {
        channelType: 0,
        streamTypes: 2,
        streamMode: "default",
        subscribeUidGroup: 1,
        // audioProfile: 1,
        videoStreamType: 0,
        maxIdleTime: 120,
      },
      recordingFileConfig: {
        avFileType: ["hls"],
      },
      storageConfig,
    },
  };

  try {
    const apiLink = `https://api.agora.io/v1/apps/${configs.agoraAppId}/cloud_recording/resourceid/${resourceId}/mode/individual/start`;

    const startRecordingResp = await axios.post(apiLink, payload, {
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        Authorization: encodedCredential,
      },
    });

    if (startRecordingResp) {
      return { resourceId, sid: startRecordingResp.data.sid };
    }
  } catch (err) {
    throw err;
  }
};

export const stopCloudRecording = async (
  channelId: string,
  resourceId: string,
  sid: string
) => {
  try {
    const resp = await axios.post(
      `https://api.agora.io/v1/apps/${configs.agoraAppId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/individual/stop`,
      {
        cname: channelId,
        uid: "1234",
        clientRequest: {},
      },
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          Authorization: encodedCredential,
        },
      }
    );

    return resp?.data;
  } catch (err) {
    console.log("stop recording error", (err as any).response.data);
    throw err;
  }
};
