import { gql } from "@apollo/client";

const otherNotifications = {
  UPDATE_NOTIFICATION: gql`
    mutation UpdateNotification($details: String!) {
      updateNotification(details: $details)
    }
  `,
  ADD_AREA_OF_KNOWLEDGE: gql`
    mutation AddAreaOfKnowledge($area: String!) {
      addAreaOfKnowledge(area: $area) {
        _id
        creationDate
        areaKnowledge
        creator {
          _id
          appid
          profilePic
          firstname
          lastname
        }
      }
    }
  `,
  START_RECORDING: gql`
    mutation StartRecording(
      $channelId: String
      $userId: String
      $token: String
    ) {
      startLiveStreamRecording(
        channelId: $channelId
        userId: $userId
        token: $token
      ) {
        resourceId
        sid
      }
    }
  `,
  STOP_RECORDING: gql`
    mutation StopRecording(
      $channelId: String
      $resourceId: String
      $sid: String
    ) {
      stopLiveStreamRecording(
        channelId: $channelId
        resourceId: $resourceId
        sid: $sid
      ) {
        fileId
        resourceData
        s3Bucket
        s3ObjectKey
      }
    }
  `,
  SEND_ERRORS: gql`
    mutation SendErrors($details: String!) {
      sendErrors(details: $details)
    }
  `,
  CONTACT_POLDIT: gql`
    mutation ContactUs($details: String!) {
      contactUs(details: $details)
    }
  `,
  REMOVE_AREA_OF_KNOWLEDGE: gql`
    mutation RemoveAreaOfKnowledge($area: String!) {
      removeAreaOfKnowledge(area: $area)
    }
  `,
  ADD_UID_USERID: gql`
    mutation AddUidUserId(
      $channelName: String!
      $uid: String
      $clientType: String
      $userId: String
    ) {
      addUidUserId(
        channelName: $channelName
        uid: $uid
        clientType: $clientType
        userId: $userId
      )
    }
  `,
};

export default otherNotifications;
