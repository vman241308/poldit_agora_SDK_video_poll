import devCredentials from "./gsCloudSecret_dev.json";
import prodCredentials from "./gsCloudSecret_prod.json";

let pubSubOptions: any = {};

if (process.env.NODE_ENV?.trim() === "development") {
  pubSubOptions.projectId = devCredentials.project_id;
  pubSubOptions.credentials = {
    client_email: devCredentials.client_email,
    private_key: devCredentials.private_key,
  };
} else {
  pubSubOptions.projectId = prodCredentials.project_id;
  pubSubOptions.credentials = {
    client_email: prodCredentials.client_email,
    private_key: prodCredentials.private_key,
  };
}

export default pubSubOptions;
