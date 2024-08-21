import * as dotenv from "dotenv";

dotenv.config();

const MONGO_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

const AWS_STORAGE_CONFIG = {
  vendor: 1,
  region: 1,
  bucket: process.env.AWS_AGORA_BUCKET,
  accessKey: process.env.AWS_AGORA_IAM_ACCESS,
  secretKey: process.env.AWS_AGORA_IAM_SECRET,
};

const ADMIN_EMAILS = ["rahmad@poldit.com", "lraimondi@poldit.com"];

export default {
  LocalHost: process.env.NEXT_PUBLIC_LOCAL_HOST ?? "",
  adminEmails: ADMIN_EMAILS,
  agoraAppCert: process.env.AGORA_APP_CERT ?? "",
  agoraAppId: process.env.AGORA_APP_ID ?? "",
  agoraNotificationSecret: process.env.AGORA_NOTIFICATIION_SECRET ?? "",
  ablyKey: process.env.ABLY_KEY ?? "",
  openApiKey: process.env.OPEN_AI_SECRET ?? "",
  ablyKeyDev: process.env.ABLY_KEY_DEV ?? "",
  ablyClientId: process.env.ABLY_CLIENT_ID ?? "",
  isDev: process.env.NODE_ENV?.trim() === "development" ? true : false,
  googleGeoKey: process.env.GOOGLE_GEOLOCATION_API_KEY ?? "",
  gaTag: process.env.NEXT_PUBLIC_GA_ID ?? "",
  ApiHost: process.env.APOLLO_URI ?? "",
  BaseURL: process.env.BASE_URL ?? "",
  appPort: process.env.APP_PORT ?? 0,
  apiURL: process.env.API_URL ?? "",
  wsUrl: process.env.WS_URL ?? "",
  S3BucketUrl: process.env.S3_BUCKET_URL ?? "",
  MongoDBPort: process.env.REACT_APP_MONGODBPORT ?? "",
  StatesAPIKey: process.env.REACT_APP_STATESAPIKEY ?? "",
  DbUriDev: process.env.DEV_DB_URL ?? "",
  DbUriProd: process.env.PROD_DB_URL ?? "",
  DevBaseUrl: process.env.FRONT_END_DEV_BASE_URL ?? "",
  ProdBaseUrl: process.env.FRONT_END_PROD_BASE_URL ?? "",
  DevInternalUrl: process.env.FRONT_END_DEV_INTERNAL_URL ?? "",
  ProdInternalUrl: process.env.FRONT_END_PROD_INTERNAL_URL ?? "",
  CompositionServerUrl: process.env.COMPOSITION_SERVER_URL ?? "",
  JwtKey: process.env.JWT_KEY ?? "",
  RefreshKey: process.env.REFRESH_KEY ?? "",
  JwtExpires: process.env.JWT_TOKEN_EXPIRES ?? "",
  RefreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES ?? "",
  MONGO_OPTIONS,
  ModeratorAPIKey: process.env.MODERATOR_KEY ?? "",
  ModeratorEndPoint: process.env.MODERATOR_API ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ?? "",
  googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN ?? "",
  polditEmail: process.env.POLDIT_EMAIL ?? "",
  storageOptions: AWS_STORAGE_CONFIG,
  agoraCustomerCredential: process.env.AGORA_CUSTOMER_CREDENTIALS ?? "",
  activeFenceKey: process.env.ACTIVE_FENCE_API_KEY
};
