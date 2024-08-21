import { gql } from "@apollo/client";

const topicQueries = {
  GET_TOPICS: gql`
    query Topics {
      topics {
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
  TOPICS_WITH_CONTENT: gql`
    query TopicsWithContent($limit: Int) {
      topicsWithContent(limit: $limit) {
        _id
        topic
        numPolls
        image
      }
    }
  `,
  GET_SUBTOPICS: gql`
    query SubTopics {
      subTopics {
        _id
        subTopic
        description
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
  GET_SUBTOPICS_PER_TOPIC: gql`
    query SubTopicsPerTopic($topic: String!) {
      subTopicsPerTopic(topic: $topic) {
        _id
        subTopic
        description
        creationDate
        creator {
          _id
          appid
        }
        topic {
          _id
          topic
        }
      }
    }
  `,
  GET_TOPICS_WITH_COUNTS: gql`
    query TopicWithCounts {
      topicWithCounts {
        _id
        topic
        numPolls
      }
    }
  `,
  GET_SUBTOPICS_PER_TOPIC_WITH_COUNTS: gql`
    query SubTopicsPerTopicWithCounts($topic: String!) {
      subTopicsPerTopicWithCounts(topic: $topic) {
        topic {
          _id
          topic
        }
        subtopics {
          _id
          subTopic
          numPolls
        }
      }
    }
  `,
  GET_SUBTOPIC_PAGES_PER_TOPIC: gql`
    query SubTopicsPerTopic_paginated(
      $cursor: String
      $topic: String!
      $limit: Int
    ) {
      subTopicsPerTopic_paginated(
        cursor: $cursor
        topic: $topic
        limit: $limit
      ) {
        cursor
        hasMoreData
        data {
          _id
          subTopic
          description
          creationDate
        }
      }
    }
  `,
};

export default topicQueries;
