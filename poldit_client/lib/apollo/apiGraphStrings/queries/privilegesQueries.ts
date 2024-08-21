import { gql } from "@apollo/client";

const privilegeQueries = {
  GET_ALL_PRIVILEGES: gql`
    query AllPrivileges {
      allPrivileges {
        _id
        privilegeName
        privilegeStatus
      }
    }
  `,
};

export default privilegeQueries;
