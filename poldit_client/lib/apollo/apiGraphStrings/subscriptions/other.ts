import { gql } from "@apollo/client";

const otherSubscriptions = {
  // FOLLOWER_SUBSCRIPTION: gql`
  //   subscription NewFollower {
  //     newFollower {
  //       _id
  //       user {
  //         appid
  //         profilePic
  //         firstname
  //         lastname
  //       }
  //       pageLoc
  //       isActive
  //       remove
  //       pollQuestion {
  //         question
  //       }
  //     }
  //   }
  // `,
  FOLLOWER_SUBSCRIPTION: gql`
    subscription NewFollower {
      newFollower {
        _id
        userId
        appId
        profilePic
        firstname
        lastname
        pageLoc
        isActive
        removeFlag
        pollQuestion
      }
    }
  `,

  NOTIFICATION_SUBSCRIPTION: gql`
    subscription NewNotification {
      newNotification {
        _id
        message
        read
        collectionType
        creationDate
        collectionId
        parentCollectionId {
          _id
          question
        }
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
};

export default otherSubscriptions;
