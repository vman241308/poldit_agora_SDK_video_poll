import { gql } from "@apollo/client";

const otherQueries = {
  GET_STATES_US: gql`
    query StatesUS {
      statesUS {
        id
        name
        classification
        division_id
        url
      }
    }
  `,
  GET_BROADCAST_CONTENT: gql`
    query GetSpecificContent($_id: String!, $contentType: String!) {
      getSpecificContent(_id: $_id, contentType: $contentType) {
        contentId
        contentType
        content {
          ... on PollQuestion {
            _id
            question
            creationDate
            answers {
              _id
              answer
              multichoice {
                _id
                answerVal
              }
            }
            creator {
              _id
              firstname
              lastname
              appid
              profilePic
            }
          }
          ... on Answer {
            _id
            answer
          }
          ... on ChatMessage {
            _id
            message
          }
        }
      }
    }
  `,
  // GET_NOTIFICATIONS: gql`
  //   query Notifications {
  //     notifications {
  //       _id
  //       message
  //       creationDate
  //       read
  //       notificationType
  //       notificationId
  //       contentOwner {
  //         _id
  //       }
  //       user {
  //         _id
  //         appid
  //         profilePic
  //       }
  //     }
  //   }
  // `,
  GET_NOTIFICATIONS_WITH_PAGINATION: gql`
    query NotificationsWithPagination($cursor: String, $limit: Int) {
      notificationsWithPagination(cursor: $cursor, limit: $limit) {
        cursor
        hasMoreData
        userId
        totalUnreadNotifications
        notifications {
          _id
          message
          creationDate
          read
          collectionType
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
    }
  `,
  AREAS_OF_KNOWLEDGE: gql`
    query AreasOfKnowledge {
      areasOfKnowledge {
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
  GET_REALTIME_KEY: gql`
    query GetRealTimeKey {
      getRealTimeKey
    }
  `,
  GET_STREAM_KEYS: gql`
    query GetStreamKeys($channel: String!, $isPublisher: Boolean!) {
      getStreamKeys(channel: $channel, isPublisher: $isPublisher) {
        appId
        token
      }
    }
  `,
  VALID_TOKEN: gql`
    query AccessTokenValid {
      accessTokenValid
    }
  `,
  GET_LINK_METADATA: gql`
    query GetLinkMetaData($link: String!) {
      getLinkMetaData(link: $link) {
        title
        favicon
        description
        image
        datePublished
      }
    }
  `,
  GET_LIVESTREAM_USER_ID: gql`
    query GetLiveStreamUser($liveStreamId: String!, $pollId: String!) {
      getLiveStreamUser(liveStreamId: $liveStreamId, pollId: $pollId) {
        userId
        mediaType
      }
    }
  `,

  SEARCH_ALL: gql`
    query SearchAll($searchVal: String, $page: Int, $limit: Int) {
      searchAll(searchVal: $searchVal, page: $page, limit: $limit) {
        question {
          count
          question {
            _id
            question
            topic {
              _id
              topic
            }
            subTopics {
              _id
              subTopic
              topic {
                _id
              }
            }
            pollImages
            answers {
              _id
            }
            creationDate
            creator {
              _id
              appid
              firstname
              lastname
              profilePic
            }
            views
            chatMssgs {
              _id
            }
          }
        }
        answer {
          count
          answer {
            _id
            answer
            poll {
              _id
              question
              creator {
                _id
                appid
              }
            }
            likes {
              _id
              like
            }
            dislikes {
              _id
              dislike
            }
            creationDate
            creator {
              _id
              appid
              firstname
              lastname
              profilePic
            }
          }
        }
        topic {
          count
          topic {
            _id
            topic
            description
            pollCount
            subTopics {
              _id
              subTopic
            }
          }
        }
        subTopic {
          count
          subTopic {
            _id
            subTopic
            description
            pollCount
            topic {
              _id
              topic
            }
          }
        }
        user {
          count
          user {
            _id
            appid
            firstname
            lastname
            profilePic
            isActive
          }
        }
      }
    }
  `,
};

export default otherQueries;
