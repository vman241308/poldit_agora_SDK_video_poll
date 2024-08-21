import configs from "../../endpoints.config";

const { DevBaseUrl, ProdBaseUrl, ProdInternalUrl, DevInternalUrl } = configs;

const { DEV_DB_URL, PROD_DB_URL } = process.env;

export const db_url = () => {
  return process.env.NODE_ENV?.trim() === "development"
    ? (DEV_DB_URL as string)
    : (PROD_DB_URL as string);
};

export const base_url = () => {
  return process.env.NODE_ENV?.trim() === "development"
    ? (DevBaseUrl as string)
    : (ProdBaseUrl as string);
};

export const internal_url = () => {
  return process.env.NODE_ENV?.trim() === "development"
    ? (DevInternalUrl as string)
    : (ProdInternalUrl as string);
};
