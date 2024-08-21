export interface IUidStatus {
  uid: string;
  type: string;
}

export interface IMediaChanges {
  streamUid: string;
  state: string;
  time: string;
}

export default interface IComposition {
  uid: string;
  webcamVideoURL: string[];
  screenVideoURL: string[];
  webcamAudioURL: string[];
  screenAudioURL: string[];
  audioChanges: IMediaChanges[];
  videoChanges: IMediaChanges[];
  avatarURL: string;
  userName: string;
  role: string;
  firstName: string;
  lastName: string;
}
