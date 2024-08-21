import Cookies from "js-cookie";

type TGetPollTopicsSubTopics = (
  route: string,
  data: any
) => Promise<IKeyWordsResp | undefined>;

interface IKeyWordsResp {}

export const get_ai_data: TGetPollTopicsSubTopics = async (route, data) => {
  const isDev =
    !process.env.NODE_ENV || process.env.NODE_ENV === "development"
      ? true
      : false;

  const url = isDev
    ? (process.env.NEXT_PUBLIC_HTTP_API_AI_DEV as string)
    : (process.env.NEXT_PUBLIC_HTTP_API_AI_PROD as string);

  const myAuthCookie = Cookies.get("polditSession");

  try {
    const resp = await fetch(`${url}/${route}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: myAuthCookie ? `Bearer ${myAuthCookie}` : "",
      },
      body: JSON.stringify(data),
    });

    if (resp.ok) {
      return await resp.json();
    }

    return {};
  } catch (err) {
    console.log(err);
  }
};
