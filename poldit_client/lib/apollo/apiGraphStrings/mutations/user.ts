import { gql } from "@apollo/client";

const userMutations = {
  LOGIN: gql`
    mutation LogIn($credentials: String!) {
      login(credentials: $credentials)
    }
  `,
  ALT_LOGIN: gql`
    mutation AltLogin($credentials: String!) {
      altLogin(credentials: $credentials) {
        accessToken
        isNewUser
      }
    }
  `,
  REMOVE_NEW_USER_FLAG: gql`
    mutation RemoveNewUserFlag {
      removeNewUserFlag
    }
  `,
  STORE_USER_LOC: gql`
    mutation StoreUserLoc($userLoc: String) {
      storeUserLoc(userLoc: $userLoc)
    }
  `,
  VERIFY_USER_EMAIL: gql`
    mutation VerifyUserEmail($token: String!) {
      verifyUserEmail(token: $token)
    }
  `,
  REFRESH_USER_TOKEN: gql`
    mutation RefreshUserToken($email: String!) {
      refreshUserToken(email: $email)
    }
  `,
  CREATE_USER: gql`
    mutation CreateNewUser($formInputs: String!) {
      createNewUser(formInputs: $formInputs) {
        _id
      }
    }
  `,
  CHANGE_PW: gql`
    mutation ChangePassword($oldPw: String!, $newPw: String!) {
      changePassword(oldPw: $oldPw, newPw: $newPw)
    }
  `,
  UPDATE_USER: gql`
    mutation UpdateUser($formInputs: String!) {
      updateUser(formInputs: $formInputs)
    }
  `,
  ADD_FOLLOW: gql`
    mutation AddFollow($userId: String!) {
      addFollow(userId: $userId) {
        _id
      }
    }
  `,
  REMOVE_FOLLOW: gql`
    mutation RemoveFollow($userId: String!) {
      removeFollow(userId: $userId) {
        _id
      }
    }
  `,

  UPDATE_USER_PASSWORD: gql`
    mutation UpdateUserPassword($token: String!, $password: String!) {
      updateUserPassword(token: $token, password: $password)
    }
  `,
  HANDLE_FOLLOW: gql`
    mutation HandleFollow($details: String!) {
      handleFollow(details: $details)
    }
  `,
  ADD_TO_FOLLOWER_LIST: gql`
    mutation AddToFollowerList(
      $userId: String!
      $pagePath: String!
      $pollId: String!
    ) {
      addToFollowerList(userId: $userId, pagePath: $pagePath, pollId: $pollId)
    }
  `,
  SET_MY_ACTIVE_AREAS: gql`
    mutation SetMyActiveAreas($areas: [String]) {
      setMyActiveAreas(areas: $areas)
    }
  `,
  REMOVE_FROM_FOLLOWER_LIST: gql`
    mutation RemoveFromFollowerList($userId: String!) {
      removeFromFollowerList(userId: $userId)
    }
  `,
  // UPDATE_TIME_ON_SITE: gql`
  //   mutation updateTimeOnSite($userId: String!, $seconds: Int!) {
  //     updateTimeOnSite(userId: $userId, seconds: $seconds) {
  //       _id
  //     }
  //   }
  // `,
};

export default userMutations;
