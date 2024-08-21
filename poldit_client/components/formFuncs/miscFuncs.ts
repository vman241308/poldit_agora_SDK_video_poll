import {
  Answer,
  IHTMLElementForm,
  ISubTopic,
  ITopic,
} from "../appTypes/appType";

export const containsSpecialCharacters = (str: string) => {
  const regex = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;
  return regex.test(str);
};

export const containSpecialChr = (str: string, regExVal: RegExp) => {
  const regex = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;
  return regex.test(str);
};

export const getFormData = (id: string) => {
  const element: HTMLElement | null = document.getElementById(id);
  const formData = element?.querySelectorAll("input, textarea");
  let formObj: any = {};

  if (formData) {
    for (let i = 0; i < formData.length; i++) {
      const element: any = formData[i];
      formObj[element.id] = element.value;
    }

    return formObj;
  }
};

export const checkPWText = (
  pw: string,
  errList: { errMatch: boolean; msg: string }[]
) => {
  const regex = /"~!@#\$%\^\*-_=\+\[\{]\}\/;:,\.\?"/i;
  const specialChrMatch = containSpecialChr(pw, regex);
  const upperCaseMatch = /[A-Z]/.test(pw);
  const lowerCaseMatch = /[a-z]/.test(pw);
  const numerMatch = /[0-9]/.test(pw);
  const spaceMatch = /\s/.test(pw);

  return errList.map((item) => {
    if (item.msg.search("special character") > -1 && specialChrMatch) {
      item.errMatch = false;
      return item;
    }

    if (item.msg.search("8 characters") > -1 && pw.length >= 8) {
      item.errMatch = false;
      return item;
    }

    if (item.msg.search("upper case") > -1 && upperCaseMatch) {
      item.errMatch = false;
      return item;
    }

    if (item.msg.search("lower case") > -1 && lowerCaseMatch) {
      item.errMatch = false;
      return item;
    }

    if (item.msg.search("one number") > -1 && numerMatch) {
      item.errMatch = false;
      return item;
    }

    if (item.msg.search("any spaces") > -1 && !spaceMatch) {
      item.errMatch = false;
      return item;
    }

    return { ...item, errMatch: true };
  });
};

export const getCredentialProps = (formType: string) => {
  const objList = document.getElementsByTagName("input");
  const formObj: any = {};

  for (let i = 0; i < objList.length; i++) {
    const domItem = objList[i];

    if (domItem.type === "checkbox") {
      formObj[camelCaseString(domItem.id)] = domItem.checked;
    } else {
      formObj[camelCaseString(domItem.id)] = domItem.value.trim();
    }
  }

  // if (formType === "registration") {
  const bdayMonth: string = (document.getElementById("bday_month") as any)
    .value;

  const bdayDay: string = (document.getElementById("bday_day") as any).value;
  const bdayYear: string = (document.getElementById("bday_year") as any).value;

  formObj["birthday"] = `${bdayMonth}/${bdayDay}/${bdayYear}`;
  // if (selectorVal) {
  //   selectorVal.value === "Select State"
  //     ? (formObj[camelCaseString(selectorVal.id)] = "")
  //     : (formObj[camelCaseString(selectorVal.id)] = selectorVal.value);
  // }
  // }

  return formObj;
};

export const camelCaseString = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
};

export const getFormBorderStyle = (formObj: HTMLFormElement) => {
  const formBorderObj: HTMLFormElement = {} as any as HTMLFormElement;

  for (const key in formObj) {
    if (formObj[key] === "") {
      formBorderObj[key] = "form-control border border-danger";
    } else formBorderObj[key] = "form-control";
  }

  return formBorderObj;
};

export const createAppMssgList = (msgList: object[]) => {
  return JSON.stringify(msgList);
};

export const filterSubtopicsforTopic = (
  data: ITopic[] | undefined,
  selectedTopic: string | null
) => {
  return data?.filter((item) => item.topic === selectedTopic)[0]?.subTopics;
};

export const imgPickerHandler = (imgRef: any) => {
  imgRef.current.click();
  imgRef.current.value = null;
};

export const numCountDisplay = (contentCount: number) => {
  let numValString: string;

  if (contentCount > 1000000) {
    numValString = `${(contentCount / 1000000).toFixed(1)}M`;
  } else if (contentCount > 1000 && contentCount < 1000000) {
    numValString = `${(contentCount / 1000).toFixed(1)}K`;
  } else {
    numValString = String(contentCount);
  }

  return numValString;
};

export const filterSearchVals = (
  dataList: any[],
  val: string,
  filterKey: string
) => {
  const searchVal = val.toLowerCase();

  return dataList.filter((item) => {
    const itemVal: string = item[filterKey].toLowerCase();

    if (itemVal.search(searchVal) > -1) {
      return item;
    }
  });
};

export const convertFirstCharacterToUppercase = (val: string) => {
  var firstCharacter = val.substring(0, 1);
  var restString = val.substring(1);

  return firstCharacter.toUpperCase() + restString;
};
