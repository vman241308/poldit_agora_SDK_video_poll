import IAnswer from "../../../models/interfaces/answer";

// export const getNumRanking = (answers: Answer[]) => {
export const getNumRanking = (answers: IAnswer[]) => {
  if (answers.length > 0) {
    const totalFeedBackNum = answers.reduce((total, answer: IAnswer) => {
      // const totalFeedBackNum = answers.reduce((total, answer: Answer) => {
      return total + answer._doc.likes.length + answer._doc.dislikes.length;
    }, 0);

    const answersWithScore = answers.map((item) => {
      let answerScore = -9999; //Default when an answer is not ranked

      if (item._doc.likes.length > 0 || item._doc.dislikes.length > 0) {
        answerScore =
          (item._doc.likes.length - item._doc.dislikes.length) *
          ((item._doc.likes.length + item._doc.dislikes.length) /
            totalFeedBackNum);
      }

      return { ...item, _doc: { ...item._doc, score: answerScore } };
    });

    answersWithScore.sort((a, b) => b._doc.score - a._doc.score);

    let uniqueScores = answersWithScore.map((item) => item._doc.score);
    uniqueScores = uniqueScores.filter(
      (val: number, idx: number) => uniqueScores.indexOf(val) === idx
      // uniqueScores.indexOf(val) === idx && val !== 0
    );

    const answersWithRank = answersWithScore.map((item) => {
      const itemMatchIdx = uniqueScores.indexOf(item._doc.score);

      let rank: string;
      if (item._doc.likes.length === 0 && item._doc.dislikes.length === 0) {
        rank = "Not Ranked";
      } else rank = `${itemMatchIdx + 1}`;

      const { score, ...rest } = item._doc;
      return { ...item, _doc: { ...rest, rank } };
    });

    return answersWithRank.sort((a, b) => {
      return a._doc.rank.toString().localeCompare(b._doc.rank.toString());
    });
  }

  return [];
};

interface Multichoice {
  _id: string;
  answerVal: string;
  votes: number;
  rank: string;
}

export const getNumRanking_multi = (answer: IAnswer) => {
  const multiAnswers = answer.multichoice;
  const answerVotes = answer.multichoiceVotes;

  const answersWithScore = multiAnswers.map((item: any) => {
    const votesPerAnswer = answerVotes.filter(
      (x) => x.vote === item._id.toString()
    );

    const score = votesPerAnswer.length / answerVotes.length;
    const votes = votesPerAnswer.length;

    const itemData = item._doc ? { ...item._doc } : { ...item };

    return { ...itemData, score, votes };
  });

  answersWithScore.sort((a, b) => b.score - a.score);

  let uniqueScores = answersWithScore.map((item) => item.score);
  uniqueScores = uniqueScores.filter(
    (val: number, idx: number) => uniqueScores.indexOf(val) === idx
    // uniqueScores.indexOf(val) === idx && val !== 0
  );

  return answersWithScore.map((item) => {
    const itemMatchIdx = uniqueScores.indexOf(item.score);

    let rank: string;
    if (item.score === 0) {
      rank = "Not Ranked";
    } else rank = `Rank ${itemMatchIdx + 1} of ${multiAnswers.length}`;

    const { score, ...rest } = item;
    return { ...rest, rank };
  });

  // console.log({answersWithRank})

  // return answersWithRank.sort((a, b) => {
  //   return b.rank.toString().localeCompare(a.rank.toString());
  // });
};
