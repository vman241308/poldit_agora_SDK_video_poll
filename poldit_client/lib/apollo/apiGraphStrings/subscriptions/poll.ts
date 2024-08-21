import { gql } from "@apollo/client";

const pollSubscriptions = {
  CHAT_SUBSCRIPTION: gql`
    subscription OnMessageAdded($pollId: String!) {
      newMessage(pollId: $pollId) {
        _id
        message
        creationDate
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
          rank
          numLikes
          isDisabled
          numDisLikes
          #likes {
          #  _id
          #}
          #dislikes {
          #  _id
          #}
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
        poll {
          _id
        }
      }
    }
  `,
  POLL_CHAT_USER_SUBSCRIPTION: gql`
    subscription ChatUserAdded($pollId: String!) {
      newChatUser(pollId: $pollId) {
        id
        appid
        numPolls
        profilePic
        fullName
        numAnswers
        followers {
          _id
        }
        lastChatMssgDate
        isActive
        isFollowed
        remove
        pollId
      }
    }
  `,
  QUESTION_SUBSCRIPTION: gql`
    subscription OnQuestionAdded($parentId: String!) {
      newQuestion(parentId: $parentId) {
        _id
        pollType
        question
        answerCount
        likesCount
        isBroadcasted
        creationDate
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
  `,
  UPDATE_QUESTION_SUBSCRIPTION: gql`
    subscription OnQuestionUpdated($pollId: String!) {
      updateQuestion(pollId: $pollId) {
        _id
        topics {
          _id
          topic
        }
        subTopics {
          _id
          subTopic
        }
        keywords
      }
    }
  `,
  CHILD_ANSWER_SUBSCRIPTION: gql`
    subscription OnChildAnswerAdded($questionId: String!) {
      newChildAnswer(questionId: $questionId) {
        _id
        answer
        creator {
          _id
          appid
          firstname
          lastname
        }
        answerImage
        poll {
          _id
        }
        isEditable
        isRemoveable
        isRemoved
        isDisabled
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
        creationDate
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
      }
    }
  `,

  ANSWER_SUBSCRIPTION: gql`
    subscription OnAnswerAdded($pollId: String!) {
      newAnswer(pollId: $pollId) {
        _id
        answer
        creator {
          _id
          appid
          firstname
          lastname
        }
        answerImage
        poll {
          _id
        }
        isEditable
        isRemoveable
        isRemoved
        isDisabled
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
        creationDate
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
      }
    }
  `,
  ANSWERS_SUBSCRIPTION: gql`
    subscription OnAnswerUpdated($pollId: String!) {
      updatedAnswers(pollId: $pollId) {
        _id
        answer
        creator {
          _id
          appid
        }
        multichoice {
          _id
          answerVal
        }
        answerImage
        isDisabled
        creationDate
        likes {
          userId
          like
        }
        dislikes {
          userId
          dislike
        }
        rank
      }
    }
  `,
};

export default pollSubscriptions;
