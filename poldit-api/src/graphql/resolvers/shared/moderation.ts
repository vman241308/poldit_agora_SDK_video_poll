import {
  ContentModeratorClientContext,
  TextModeration,
} from "@azure/cognitiveservices-contentmoderator";
import { CognitiveServicesCredentials } from "@azure/ms-rest-azure-js";
import { roundValue } from "../../../globalFunctions";
import configs from "../../../endpoints.config";
import axios from "axios";

const { ModeratorAPIKey, ModeratorEndPoint } = configs;

export const moderateTextContent = async (content: string, id: string) => {
  try {
    const { data } = await axios.post(
      "https://apis.activefence.com/v3/content/text",
      {
        text: content,
        content_id: id,
        callback_url: `https://api1.poldit.com/`,
      },
      {
        headers: {
          "af-api-key": configs.activeFenceKey as string,
        },
      }
    );
  } catch (err) {
    return;
  }
};

export const moderateText = async (content: string) => {
  const cognitiveServiceCredentials = new CognitiveServicesCredentials(
    ModeratorAPIKey
  );

  const client = new ContentModeratorClientContext(
    cognitiveServiceCredentials,
    ModeratorEndPoint
  );

  const textmoderator = new TextModeration(client);

  const allowedWords = ["crap", "breast", "pee", "role playing"];
  const trueContent = content.replace(
    new RegExp(allowedWords.join("|"), "gi"),
    ""
  );

  try {
    const moderationResults = await textmoderator.screenText(
      "text/plain",
      trueContent,
      {
        classify: true,
      }
    );

    if (moderationResults) {
      const { classification, terms, language, normalizedText } =
        moderationResults;
      const sexuallyExplicitCat = roundValue(classification?.category1?.score);
      const sexuallySugestiveCat = roundValue(classification?.category2?.score);
      const offensiveLangCat = roundValue(classification?.category3?.score);

      let blockContent: boolean = false;
      const modScore =
        sexuallyExplicitCat + sexuallySugestiveCat + offensiveLangCat;

      if (
        modScore > 190 ||
        sexuallyExplicitCat >= 99 ||
        sexuallySugestiveCat >= 99 ||
        offensiveLangCat >= 99
      ) {
        blockContent = true;
      }

      return {
        moderationType: "text",
        sexuallyExplicitCat,
        sexuallySugestiveCat,
        offensiveLangCat,
        terms,
        language,
        reviewRecommended: classification?.reviewRecommended,
        blockContent,
      };
    }
  } catch (err) {
    throw new Error("Cannot access Moderation Api.  Check keys");
  }
};

const customWordFlag = (content: string) => {
  const curseWords = ["crap", "breast", "pee"];

  return curseWords.some((item) => content.toLowerCase().search(item) > -1);
};
