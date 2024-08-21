import validator from "validator";

export const emailValidation = (email: string) => {
  if (validator.isEmail(email)) {
    return true;
  } else {
    return false;
  }
};
