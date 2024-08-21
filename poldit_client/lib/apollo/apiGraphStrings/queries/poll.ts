import { gql } from "@apollo/client";

const pollQueries = {
  GET_POLLS_ALL: gql`
    query Polls {
      polls {
        _id
        question
        topic {
          _id
          topic
        }
        subTopics {
          _id
          subTopic
        }
        answers {
          _id
        }
        creationDate
        pollImages
        creator {
          _id
          appid
          profilePic
        }
        views
        chatMssgs {
          _id
        }
      }
    }
  `,
  GET_POLL: gql`
    query Poll($pollId: String!) {
      poll(pollId: $pollId) {
        _id
        question
        isEditable
        isMyPoll
        auditHistory {
          _id
          action
          actionDate
        }
        isActive
        topic {
          _id
          topic
        }
        topics {
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
        keywords
        pollImages
        pollType
        answers {
          _id
        }
        creationDate
        creator {
          _id
          appid
          profilePic
          firstname
          lastname
        }
        views
        chatMssgs {
          _id
        }
      }
    }
  `,
  GET_USERPOLLS: gql`
    query PollsByUser($userId: String, $offset: Int, $limit: Int) {
      pollsByUser(userId: $userId, offset: $offset, limit: $limit) {
        _id
        pollType
        question
        answerCount
        isMultipleChoice
        isMyPoll
        isFavorite
        lastActivity
        chatMssgsCount
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
        creationDate
        creator {
          _id
          appid
          profilePic
          firstname
          lastname
        }
        views
        totalPolls
      }
    }
  `,

  GET_POLLS_BY_TAG: gql`
    query PollsByTag($tag: String, $offset: Int, $limit: Int) {
      pollsByTag(tag: $tag, offset: $offset, limit: $limit) {
        _id
        pollType
        question
        answerCount
        isMultipleChoice
        isMyPoll
        isFavorite
        lastActivity
        totalPolls
        chatMssgsCount
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
        creationDate
        creator {
          _id
          appid
          profilePic
          firstname
          lastname
        }
        views
      }
    }
  `,

  GET_FAVORITE_POLLS: gql`
    query GetFavoritePolls($offset: Int, $limit: Int) {
      getFavoritePolls(offset: $offset, limit: $limit) {
        _id
        pollType
        question
        answerCount
        isMultipleChoice
        isMyPoll
        isFavorite
        lastActivity
        chatMssgsCount
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
        creationDate
        creator {
          _id
          appid
          profilePic
          firstname
          lastname
        }
        views
        totalPolls
      }
    }
  `,

  CHILD_POLLS_FOR_PARENT: gql`
    query ChildPollsForParentPoll(
      $cursor: String
      $limit: Int
      $pollId: String
      $sortBy: String
    ) {
      childPollsForParentPoll(
        cursor: $cursor
        limit: $limit
        pollId: $pollId
        sortBy: $sortBy
      ) {
        cursor
        hasMoreData
        totalPolls
        polls {
          _id
          pollType
          question
          answerCount
          likesCount
          creationDate
          isBroadcasted
          parentPollId {
            _id
          }
          dislikesCount
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

  // CHILD_POLLS_FOR_PARENT: gql`
  //   query ChildPollsForParentPoll(
  //     $offset: Int
  //     $limit: Int
  //     $pollId: String
  //     $sortBy: String
  //   ) {
  //     childPollsForParentPoll(
  //       offset: $offset
  //       limit: $limit
  //       pollId: $pollId
  //       sortBy: $sortBy
  //     ) {
  //       _id
  //       pollType
  //       question
  //       answerCount
  //       likesCount
  //       creationDate
  //       parentPollId {
  //         _id
  //       }
  //       dislikesCount
  //       creator {
  //         _id
  //         appid
  //         profilePic
  //         firstname
  //         lastname
  //       }
  //     }
  //   }
  // `,

  NEWEST_POLLS_WITH_PAGINATION: gql`
    query NewestPollsWithPagination($offset: Int, $limit: Int, $topic: String) {
      newestPollsWithPagination(offset: $offset, limit: $limit, topic: $topic) {
        _id
        pollType
        question
        answerCount
        isMultipleChoice
        isMyPoll
        isFavorite
        isActive
        lastActivity
        chatMssgsCount
        topic {
          _id
          topic
        }
        topics {
          _id
          topic
        }
        keywords
        subTopics {
          _id
          subTopic
          topic {
            _id
          }
        }
        pollImages
        creationDate
        creator {
          _id
          appid
          profilePic
          firstname
          lastname
        }
        views
        totalPolls
      }
    }
  `,
  GET_POLLS_BY_TOPIC: gql`
    query PollsByTopic($topic: String!) {
      pollsByTopic(topic: $topic) {
        _id
        question
        topic {
          _id
          topic
        }
        subTopics {
          _id
          subTopic
        }
        pollImages
        answers {
          _id
        }
        creationDate
        creator {
          _id
          appid
          profilePic
          firstname
          lastname
        }
        views
        chatMssgs {
          _id
        }
      }
    }
  `,
  GET_POLLS_BY_SUBTOPIC: gql`
    query PollsBySubTopic($subTopic: String!) {
      pollsBySubTopic(subTopic: $subTopic) {
        _id
        question
        topic {
          _id
          topic
        }
        subTopics {
          _id
          subTopic
        }
        pollImages
        answers {
          _id
        }
        creationDate
        creator {
          _id
          appid
          profilePic
        }
        views
        chatMssgs {
          _id
        }
      }
    }
  `,
  ACTIVECHAT_WITH_PAGINATION: gql`
    query ActiveChatsWithPagination($offset: Int, $limit: Int) {
      activeChatsWithPagination(offset: $offset, limit: $limit) {
        _id
        pollType
        question
        answerCount
        chatMssgsCount
        isMultipleChoice
        isFavorite
        isActive
        isMyPoll
        lastActivity
        topic {
          _id
          topic
        }
        topics {
          _id
          topic
        }
        keywords
        subTopics {
          _id
          subTopic
          topic {
            _id
          }
        }
        pollImages
        creationDate
        creator {
          _id
          appid
          profilePic
          firstname
          lastname
        }
        views
        totalPolls
      }
    }
  `,
  TRENDING_POLLS_WITH_PAGINATION: gql`
    query TrendingPollsWithPagination(
      $offset: Int
      $limit: Int
      $topic: String
    ) {
      trendingPollsWithPagination(
        offset: $offset
        limit: $limit
        topic: $topic
      ) {
        _id
        pollType
        question
        answerCount
        isMultipleChoice
        isMyPoll
        isActive
        isFavorite
        lastActivity
        chatMssgsCount
        topic {
          _id
          topic
        }
        topics {
          _id
          topic
        }
        keywords
        subTopics {
          _id
          subTopic
          topic {
            _id
          }
        }
        pollImages
        creationDate
        creator {
          _id
          appid
          profilePic
          firstname
          lastname
        }
        views
        totalPolls
      }
    }
  `,
  RECENT_ACTIVITY_POLLS_WITH_PAGINATION: gql`
    query RecentActivityPollsWithPagination(
      $offset: Int
      $limit: Int
      $topic: String
    ) {
      recentActivityPollsWithPagination(
        offset: $offset
        limit: $limit
        topic: $topic
      ) {
        _id
        pollType
        question
        answerCount
        isMultipleChoice
        isMyPoll
        isActive
        isFavorite
        lastActivity
        chatMssgsCount
        topic {
          _id
          topic
        }
        topics {
          _id
          topic
        }
        keywords
        subTopics {
          _id
          subTopic
          topic {
            _id
          }
        }
        pollImages
        creationDate
        creator {
          _id
          appid
          profilePic
          firstname
          lastname
        }
        views
        totalPolls
      }
    }
  `,
  SHOW_VIEWS: gql`
    query ShowViews($pollId: String!) {
      showViews(pollId: $pollId)
    }
  `,
};

export default pollQueries;
