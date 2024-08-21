import { gql } from "@apollo/client";

const topicMutations = {
  CREATE_TOPIC: gql`
    mutation CreateTopic($topicInfo: String!) {
      createTopic(topicInfo: $topicInfo) {
        _id
        topic
        description
        numPolls
        creator {
          _id
          appid
        }
        creationDate
        subTopics {
          _id
          subTopic
          description
        }
      }
    }
  `,
  CREATE_SUBTOPIC: gql`
    mutation CreateSubTopic($subTopicInfo: String!) {
      createSubTopic(subTopicInfo: $subTopicInfo) {
        _id
        subTopic
        description
        creationDate
        numPolls
        creator {
          _id
          appid
        }
        topic {
          _id
          topic
          description
        }
      }
    }
  `,
  ADD_AREAS_INTEREST: gql`
    mutation AddAreasOfInterest($details: String!) {
      addAreasOfInterest(details: $details)
    }
  `,
};

export default topicMutations;
