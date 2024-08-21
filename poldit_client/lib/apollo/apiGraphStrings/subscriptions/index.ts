import pollSubscriptions from "./poll";
import otherSubscriptions from "./other";

export default {
  ...pollSubscriptions,
  ...otherSubscriptions,
};
