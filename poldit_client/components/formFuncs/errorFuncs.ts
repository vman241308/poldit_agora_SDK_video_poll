import { getCredentialProps } from "./miscFuncs";

export const errorHandling = () => {
  const { id } = document.getElementsByTagName("form")[0];
  const formObj: HTMLFormElement = getCredentialProps(id);

  const errors = [];

  for (const key in formObj) {
    const form_val = formObj[key];

    if (
      form_val.length === 0 &&
      key !== "address2" &&
      key !== "useragreementagreed"
    ) {
      errors.push({ message: `Please fill out the ${key} field` });
    }

    if (key === "useragreementagreed" && !form_val) {
      errors.push({
        message: `Please review the User Agreement and click the check box to confirm`,
      });
    }
  }
  return { formObj, errors };
};
