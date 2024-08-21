import { gql } from "@apollo/client";

const pollFeedBackMutations = {
  CREATE_ANSWER: gql`
    mutation CreateAnswer($details: String!) {
      createAnswer(details: $details)
    }
  `,
  UPDATE_ANSWER: gql`
    mutation UpdateAnswer($details: String!) {
      updateAnswer(details: $details) {
        _id
        answer
        answerImage
      }
    }
  `,
  REMOVE_ANSWER: gql`
    mutation DeleteAnswer($answerId: String!) {
      deleteAnswer(answerId: $answerId)
    }
  `,
  REMOVE_CHAT_USER: gql`
    mutation RemoveChatUser($userId: String!, $pollId: String!) {
      removeChatUser(userId: $userId, pollId: $pollId)
    }
  `,
  REPORT_CONTENT: gql`
    mutation ReportContent(
      $contentId: String!
      $contentType: String!
      $category: String!
      $creator: String!
    ) {
      reportContent(
        contentId: $contentId
        contentType: $contentType
        category: $category
        creator: $creator
      )
    }
  `,
  LIKE_DISLIKE_HANDLER: gql`
    mutation HandleLikeDislike(
      $feedback: String!
      $feedbackVal: Boolean!
      $answerId: String!
      $pollId: String!
      $isVideo: Boolean
    ) {
      handleLikeDislike(
        feedback: $feedback
        feedbackVal: $feedbackVal
        answerId: $answerId
        pollId: $pollId
        isVideo: $isVideo
      ) {
        _id
        answer
        isDisabled
        isEditable
        isRemoveable
      }
    }
  `,
  HANDLE_REACTION: gql`
    mutation HandleReaction(
      $reactionType: String!
      $reaction: Boolean!
      $chatId: String!
    ) {
      handleReaction(
        reactionType: $reactionType
        reaction: $reaction
        chatId: $chatId
      )
    }
  `,
  MULTI_CHOICE_HANDLER: gql`
    mutation HandleMultiChoice($details: String!) {
      handleMultiChoice(details: $details)
    }
  `,
  CREATE_CHAT_MESSAGE: gql`
    mutation CreateMessage($details: String!) {
      createMessage(details: $details) {
        _id
        isActive
      }
    }
  `,
  HANDLE_FAVORITE: gql`
    mutation HandleFavorite(
      $isFav: Boolean!
      $favoriteType: String!
      $favoriteId: String!
    ) {
      handleFavorite(
        isFav: $isFav
        favoriteType: $favoriteType
        favoriteId: $favoriteId
      )
    }
  `,
  // ADD_FAVORITE: gql`
  //   mutation AddFavorite($favoriteType: String!, $favoriteId: String!) {
  //     addFavorite(favoriteType: $favoriteType, favoriteId: $favoriteId) {
  //       _id
  //       favoriteId
  //       favoriteType
  //     }
  //   }
  // `,
  // REMOVE_FAVORITE: gql`
  //   mutation RemoveFavorite($favoriteType: String!, $favoriteId: String!) {
  //     removeFavorite(favoriteType: $favoriteType, favoriteId: $favoriteId) {
  //       _id
  //       favoriteId
  //       favoriteType
  //     }
  //   }
  // `,
};

export default pollFeedBackMutations;
