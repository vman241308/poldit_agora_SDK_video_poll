import { ObjectId, Types } from "mongoose";

export const dateToString = (date: Date) => new Date(date).toISOString();

export const maskLink = (linkStr: string, as: string) => {
  console.log({ linkStr, as });
};

// export const getSectionList = (flatList: any[], sectionDivider: number) => {
//   const sectionList: any[] = [];

//   const listEnd = flatList.length % sectionDivider;
//   const listParts = Math.floor(flatList.length / sectionDivider);

//   for (let i = 0; i < listParts; i++) {
//     let startIdx: number;
//     let endIdx: number;

//     if (i === 0) {
//       startIdx = 0;
//       endIdx = i + sectionDivider;
//     } else {
//       startIdx = i * sectionDivider;
//       endIdx = startIdx + sectionDivider;
//     }

//     sectionList.push(flatList.slice(startIdx, endIdx));
//   }

//   listEnd > 0 && sectionList.push(flatList.slice(-listEnd));

//   return sectionList;
// };

export const getSortedListByDate = (dataList: any[]) => {
  return dataList.sort(
    (a, b) =>
      new Date(b.creationDate).valueOf() - new Date(a.creationDate).valueOf()
  );
};

// export const getSortedListByChat = (dataList: any[]) => {
//   const listWithChatMssg = dataList.map((item) => {
//     if (item.chatMssgs) {
//       return item;
//     } else return { ...item, chatMssgs: [] };
//   });

//   const listWithChatSorted = listWithChatMssg.sort(
//     (a, b) => b.chatMssgs?.length - a.chatMssgs?.length
//   );

//   return listWithChatSorted;
// };

export const getAlphabeticalList = (dataList: any[], prop: string) => {
  return dataList.sort((a, b) => {
    const nameA = a[prop].toUpperCase();
    const nameB = b[prop].toUpperCase();

    if (nameA < nameB) {
      return -1;
    }

    if (nameA > nameB) {
      return 1;
    }

    return 0;
  });
};

export const getAlphabeticalList_reverse = (dataList: any[], prop: string) => {
  return dataList.sort((a, b) => {
    const nameA = a[prop].toUpperCase();
    const nameB = b[prop].toUpperCase();

    if (nameA > nameB) {
      return -1;
    }

    if (nameA < nameB) {
      return 1;
    }

    return 0;
  });
};

// export const getStoredSearch = () => {
//   if (typeof window !== "undefined") {
//     const storageVal = localStorage.getItem("PoldIt-data") || "";
//     const { searchVal } = JSON.parse(storageVal);
//     return searchVal;
//   }
// };

// export const storeSearchVal = (objToStore: object) => {
//   console.log(objToStore)
//   localStorage.setItem("PoldIt-data", JSON.stringify({ objToStore }));
//   return;
// };
export const showAbbreviatedTxt = (mssg: string) => {
  if (mssg.length > 25) {
    return `${mssg.slice(0, 25)}...`;
  }
  return mssg;
};

export const roundValue = (val: number | undefined) => {
  if (!val) {
    return 0;
  }
  return Math.round(val * 100);
};

export const getDiffDays = (val: any) => {
  const diffTime = Math.abs(val);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getDiffTimes_minutes = (val1: Date, val2: Date) => {
  let timeDiff = (val1.getTime() - val2.getTime()) / 60000;
  return Math.abs(Math.round(timeDiff));
};

export const convertWordToUpper = (rawTxt: string) => {
  const firstCharacter = rawTxt.substring(0, 1);
  const restString = rawTxt.substring(1);

  return firstCharacter.toUpperCase() + restString;
};

export const convertWordsToUpper = (rawTxt: string) => {
  const wordsList = rawTxt.split(" ");

  const convertedWordsList = wordsList.map((word) => convertWordToUpper(word));

  return convertedWordsList.join(" ");
};

export const getUniqueObjIdList = (vals: ObjectId[]) => {
  const ids = vals.map((x) => x.toString());

  return Array.from(new Set(ids)).map((x) => Types.ObjectId(x));
};

export const getUniqueObjList = (objList: any[]) => {
  let finalList: any[] = [];

  // const mergedList = [...list1, ...list2];

  objList.forEach((x) => {
    const match = finalList.some(
      (item) => item._id.toString() === x._id.toString()
    );

    !match && finalList.push(x);
  });

  return finalList;
};

export const removeSpecialChars = (content: string) =>
  content.replace(/[^a-zA-Z0-9,;\-.!? ]/g, "");
