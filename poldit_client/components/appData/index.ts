export const monthList = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getYear = () => {
  let yearArray = [];
  for (let i = 0; i < 60; i++) {
    yearArray.push(2021 - i);
  }
  return yearArray;
};


export const newPwErrors = [
  { errMatch: true, msg: "Must contain a minimum of 8 characters" },
  { errMatch: true, msg: "Must contain at least one upper case letter" },
  { errMatch: true, msg: "Must contain at least one lower case letter" },
  { errMatch: true, msg: "Must contain at least one number" },
  {
    errMatch: true,
    msg: "Must contain at least one special character from the following: ~ ! @ # $ % ^ * - _ = + [ { ] } / ; : , . ?",
  },
  { errMatch: true, msg: "Must not contain any spaces" },
];
