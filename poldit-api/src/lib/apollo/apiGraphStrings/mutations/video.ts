import { gql } from "@apollo/client";

const videoMutations = {
  START_COMPOSITION_VIDEO: gql`
    mutation StartCompositionVideo($channelName: String!, $fileList: String) {
      startCompositionVideo(channelName: $channelName, fileList: $fileList)
    }
  `,
};

export default videoMutations;
