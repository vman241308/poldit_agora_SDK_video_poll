import { gql } from "@apollo/client";

const privilegeMutations = {
  CREATE_NEW_PRIVILEGE: gql`
    mutation CreateNewPrivilege($privilegeName: String!) {
      createNewPrivilege(privilegeName: $privilegeName) {
        _id
      }
    }
  `,

  UPDATE_PRIVILEGES: gql`
    mutation UpdatePrivilege(
      $privilegeId: String!
      $privilegeName: String!
      $privilegeStatus: Boolean!
    ) {
      updatePrivilege(
        privilegeId: $privilegeId
        privilegeName: $privilegeName
        privilegeStatus: $privilegeStatus
      ) {
        _id
      }
    }
  `,

  DELETE_PRIVILEGE: gql`
    mutation deletePrivilege($_id: String!) {
      deletePrivilege(_id: $_id)
    }
  `,
};

export default privilegeMutations;
