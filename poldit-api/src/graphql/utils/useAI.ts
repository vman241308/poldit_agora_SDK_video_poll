import openai from "../../lib/openAi";
import * as natural from "natural";
import * as pos from "pos";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export const generateAIAnswer = async (question: string) => {
  try {
    // return await openai.createChatCompletion({
    //   model: "gpt-3.5-turbo",
    //   temperature: 0,
    //   max_tokens: 700,
    //   user: userId,
    //   messages: [
    //     { role: "system", content: "You are a helpful assistant." },
    //     ...question,
    //   ],
    //   //   stop: ["input:"],
    // });
    return await openai.createCompletion({
      model: "text-davinci-003",
      prompt: question,
      temperature: 0,
      max_tokens: 800,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      stop: ["10."],
    //   stop: ["input:"],
    });
  } catch (err) {
    return;
  }
};

export const generateAiTags = async (
  userId: string,
  topics: string,
  question: string
) => {
  try {
    const prompt = `Provide one main topic 
    from ${topics} and the top 5 high-level keywords for the following statement:${question}.  
    The text response should be a json string with keys(topic, keyword).  
    The value for key topic would be the main topic.  The value for key keyword, would be a list of the 5 high-level keywords.`;

    const resp = await openai.createCompletion({
      model: "text-davinci-003",
      temperature: 0,
      user: userId,
      prompt,
      max_tokens: 500,
    });

    const data = resp.data.choices[0].text;
    if (data) {
      console.log(resp.data.usage)
      const jsonResponse = JSON.parse(
        data.substring(data.indexOf("{"), data.lastIndexOf("}") + 1)
      );
      return jsonResponse;
    }
  } catch (err) {
    return;
  }
};

const extractKeywords = (text: string, numKeywords: number) => {
  const tokenizer = new natural.WordTokenizer();
  const words = tokenizer.tokenize(text);
  const tagger = new pos.Tagger();
  const taggedWords = tagger.tag(words);
  const keywords: string[] = [];

  for (const taggedWord of taggedWords) {
    const [word, tag] = taggedWord;
    if (tag.startsWith("NN")) {
      // Filter nouns and noun phrases
      keywords.push(word);
    }
  }

  return keywords.slice(0, numKeywords);
};

// const sentences = tokenizer.tokenize(text);
// const wordTokenizer = new natural.WordTokenizer();

// const graph = {};
// sentences.forEach((sentence) => {
//   const words = wordTokenizer.tokenize(sentence);
//   words?.forEach((word, index) => {
//     if (!graph[word]) {
//       graph[word] = [];
//     }
//     for (let i = index + 1; i < words.length; i++) {
//       const neighbor = words[i];
//       if (neighbor !== word) {
//         graph[word].push(neighbor);
//       }
//     }
//   });
// });

// // Run the TextRank algorithm to rank the words based on their importance
// const rankedWords = {};
// const dampingFactor = 0.85;
// const maxIterations = 100;
// const tolerance = 0.0001;
// let diff = 1.0;
// let iterations = 0;

// while (diff > tolerance && iterations < maxIterations) {
//   const prevRankedWords = { ...rankedWords };
//   diff = 0;

//   Object.keys(graph).forEach((word) => {
//     let rank = 1 - dampingFactor;
//     graph[word].forEach((neighbor) => {
//       const neighborRank = prevRankedWords[neighbor] || 0;
//       const outdegree = graph[neighbor].length;
//       rank += dampingFactor * (neighborRank / outdegree);
//     });
//     diff += Math.abs(rank - (rankedWords[word] || 0));
//     rankedWords[word] = rank;
//   });

//   iterations++;
// }

// Sort the words based on their rank and return the top keywords
//   const sortedKeywords = Object.entries(rankedWords).sort(
//     (a: any, b: any) => b[1] - a[1]
//   );
//   const topKeywords = sortedKeywords
//     .slice(0, numKeywords)
//     .map(([word]) => word);
//   return topKeywords;
// };

export const formatAiTxt = (val: string) => {
  let txtList = val.split(/\n/g);

  return txtList.map((x) => {
    return { type: "paragraph", children: [{ text: x }] };
  });
};
