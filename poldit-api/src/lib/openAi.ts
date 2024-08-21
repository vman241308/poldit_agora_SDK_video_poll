import { Configuration, OpenAIApi } from "openai";
import configs from "../endpoints.config";

const configuration = new Configuration({ apiKey: configs.openApiKey });

const openai = new OpenAIApi(configuration);

export default openai;
