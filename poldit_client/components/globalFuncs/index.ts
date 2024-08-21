export const dateToString = (date: Date) => new Date(date).toISOString();

export const getSectionList = (flatList: any[], sectionDivider: number) => {
  const sectionList = [];

  const listEnd = flatList.length % sectionDivider;
  const listParts = Math.floor(flatList.length / sectionDivider);

  for (let i = 0; i < listParts; i++) {
    let startIdx: number;
    let endIdx: number;

    if (i === 0) {
      startIdx = 0;
      endIdx = i + sectionDivider;
    } else {
      startIdx = i * sectionDivider;
      endIdx = startIdx + sectionDivider;
    }

    sectionList.push(flatList.slice(startIdx, endIdx));
  }

  listEnd > 0 && sectionList.push(flatList.slice(-listEnd));

  return sectionList;
};

export const getSortedListByDate = (dataList: any[]) => {
  return dataList.sort(
    (a, b) =>
      new Date(b.creationDate).valueOf() - new Date(a.creationDate).valueOf()
  );
};

export const getSortedListByChat = (dataList: any[]) => {
  const listWithChatMssg = dataList.map((item) => {
    if (item.chatMssgs) {
      return item;
    } else return { ...item, chatMssgs: [] };
  });

  const listWithChatSorted = listWithChatMssg.sort(
    (a, b) => b.chatMssgs?.length - a.chatMssgs?.length
  );

  return listWithChatSorted;
};

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

export const getStoredSearch = () => {
  if (typeof window !== "undefined") {
    const storageVal = localStorage.getItem("PoldIt-data") || "";
    const { searchVal } = JSON.parse(storageVal);
    return searchVal;
  }
};

export const clearStoredSearch = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("PoldIt-data");
  }
};

export const showAbbreviatedTxt = (mssg: string, limit: number) => {
  if (mssg.length > limit) {
    return `${mssg.slice(0, limit)}...`;
  }
  return mssg;
};

export const roundValue = (val: number | undefined) => {
  if (!val) {
    return 0;
  }
  return Math.round(val * 100);
};

export const getUniqueObjList = (list1: any[], list2: any[]) => {
  let finalList: any[] = [];

  const mergedList = [...list1, ...list2];

  mergedList.forEach((x) => {
    const match = finalList.some((item) => item.id === x.id);

    !match && finalList.push(x);
  });

  return finalList;
};

export const getUniqueStringList = (valList: string[]) => {
  return Array.from(new Set(valList));
};

export const getUniqueObjsList = (list: any[], key: string) => {
  let finalList: any[] = [];

  list.forEach((x) => {
    const match = finalList.some((item) => item[key] === x[key]);
    !match && finalList.push(x);
  });

  return finalList;
};

export const getObjList_NoDuplicates = (
  list1: any[],
  list2: any[],
  key: string
) => {
  let finalList: any[] = list1;

  list2.forEach((x) => {
    const match = finalList.some(
      (item) => item[key as string] === x[key as string]
    );

    !match && finalList.push(x);
  });

  return finalList;
};

export const isURL = (val: string) => {
  return LINK_REGEX.test(val);
};

export const LINK_REGEX =
  /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/g;

export const capitalizeWord = (val: string) => {
  return val.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
};

//Create an ES6 function that calculates the time difference between a timestamp and Date.now() and returns the difference in hours?
export const getTimeDifference = (
  valType: "hours" | "days" | "minutes" | "seconds",
  timestamp: number
) => {
  let now = new Date();
  let difference = now.getTime() - timestamp;
  let seconds = Math.floor(difference / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);

  switch (valType) {
    case "hours":
      return hours;
    case "days":
      return days;
    default:
      return seconds;
  }
};
