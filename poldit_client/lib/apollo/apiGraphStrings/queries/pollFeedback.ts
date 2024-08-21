import { gql } from "@apollo/client";

const pollFeedBackQueries = {
  GET_ANSWERS_BY_POLL: gql`
    query AnswersByPoll($pollId: String!, $numAnswers: Int) {
      answersByPoll(pollId: $pollId, numAnswers: $numAnswers) {
        _id
        answer
        creator {
          _id
          appid
          firstname
          lastname
        }
        answerImage
        creationDate
        isDisabled
        isEditable
        isRemoveable
        isRemoved
        likes {
          _id
          userId
          like
        }
        dislikes {
          _id
          userId
          dislike
        }
        rank
        multichoice {
          _id
          answerVal
          rank
          votes
        }
        multichoiceVotes {
          _id
          userId
          vote
        }
      }
    }
  `,
  GET_TOP_ANSWERS_BY_POLL: gql`
  query TopAnswersByPoll($pollId: String!, $numAnswers: Int) {
    topAnswersByPoll(pollId: $pollId, numAnswers: $numAnswers) {
      _id
      answer
      creator {
        _id
        appid
        firstname
        lastname
      }
      answerImage
      creationDate
      isDisabled
      isEditable
      isRemoveable
      isRemoved
      likes {
        _id
        userId
        like
      }
      dislikes {
        _id
        userId
        dislike
      }
      rank
      multichoice {
        _id
        answerVal
        rank
        votes
      }
      multichoiceVotes {
        _id
        userId
        vote
      }
    }
  }
  `,
  GET_ANSWERS_BY_CHILD_POLL: gql`
    query AnswersForChildPoll(
      $offset: Int
      $limit: Int
      $pollId: String
      $sortBy: String
    ) {
      answersForChildPoll(
        offset: $offset
        limit: $limit
        pollId: $pollId
        sortBy: $sortBy
      ) {
        _id
        answer
        creator {
          _id
          appid
          firstname
          lastname
        }
        answerImage
        creationDate
        isDisabled
        isEditable
        isRemoveable
        isRemoved
        likes {
          _id
          userId
          like
        }
        dislikes {
          _id
          userId
          dislike
        }
        rank
        multichoice {
          _id
          answerVal
          rank
          votes
        }
        multichoiceVotes {
          _id
          userId
          vote
        }
      }
    }
  `,
  GET_ANSWERS_SORTED: gql`
    query AnswersForPollBySortCriteria($pollId: String!, $filter: String) {
      answersForPollBySortCriteria(pollId: $pollId, filter: $filter) {
        _id
        answer
        creator {
          _id
          appid
          firstname
          lastname
        }
        answerImage
        creationDate
        isDisabled
        isEditable
        isRemoveable
        isRemoved
        likes {
          _id
          userId
          like
        }
        dislikes {
          _id
          userId
          dislike
        }
        rank
        multichoice {
          _id
          answerVal
          rank
          votes
        }
        multichoiceVotes {
          _id
          userId
          vote
        }
      }
    }
  `,
  GET_POLL_CHAT_USERS: gql`
    query PollChatUsers($pollId: String!) {
      pollChatUsers(pollId: $pollId) {
        id
        appid
        profilePic
        fullName
        followers {
          _id
        }
        numPolls
        numAnswers
        lastChatMssgDate
        isActive
        isFollowed
        pollId
      }
    }
  `,
  IS_FAVORITE: gql`
    query IsFavorite($favType: String!, $favId: String!) {
      isFavorite(favType: $favType, favId: $favId)
    }
  `,
  LAST_ACTIVITY: gql`
    query LastActivity($pollId: String!) {
      lastActivity(pollId: $pollId)
    }
  `,
  GET_POLL_CHATS: gql`
    query MessagesByPoll($pollId: String!) {
      messagesByPoll(pollId: $pollId) {
        _id
        message
        creator {
          _id
          appid
          profilePic
        }
        creationDate
        poll {
          _id
        }
      }
    }
  `,
  GET_ALL_POLL_CHAT_USERS: gql`
    query AllPollChatUsers($pollId: String!) {
      allPollChatUsers(pollId: $pollId) {
        _id
        appid
        firstname
        lastname
        profilePic
      }
    }
  `,
  GET_POLL_CHAT_PAGES: gql`
    query MessageFeedByPoll($cursor: String, $pollId: String!, $limit: Int) {
      messageFeedByPoll(cursor: $cursor, pollId: $pollId, limit: $limit) {
        cursor
        hasMoreData
        totalMssgs
        messages {
          _id
          message
          isActive
          likes {
            _id
            userId
            like
          }
          dislikes {
            _id
            userId
            dislike
          }
          hearts {
            _id
            userId
            heart
          }
          laughs {
            _id
            userId
            laugh
          }
          sadFaces {
            _id
            userId
            sadFace
          }
          angryFaces {
            _id
            userId
            angryFace
          }
          msgRef {
            _id
            message
            isActive
            creator {
              _id
              appid
              profilePic
              firstname
              lastname
            }
            creationDate
          }
          ansRef {
            _id
            answer
            creationDate
            isDisabled
            rank
            numLikes
            numDisLikes

            creator {
              _id
              appid
            }
          }
          creator {
            _id
            appid
            profilePic
            firstname
            lastname
          }
          creationDate
          poll {
            _id
          }
        }
      }
    }
  `,
};

export default pollFeedBackQueries;
