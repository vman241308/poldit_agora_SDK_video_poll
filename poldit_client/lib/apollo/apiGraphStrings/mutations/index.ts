import userMutations from "./user";
import pollMutations from "./poll";
import topicMutations from "./topics";
import otherMutations from "./other";
import imgMutations from "./image";
import pollFeedbackMutations from "./pollFeedBack";
import privilegeMutations from "./privilegeMutations";

export default {
  ...userMutations,
  ...pollMutations,
  ...topicMutations,
  ...imgMutations,
  ...otherMutations,
  ...pollFeedbackMutations,
  ...privilegeMutations,
};
