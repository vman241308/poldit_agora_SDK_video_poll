import { NextSeo } from "next-seo";

interface Metadata {
  title: string;
  description?: string;
  url?: string;
}

const Metadata = ({ title, description, url }: Metadata) => {
  const defaultDesc =
    "Poldit is a place where you can ask questions, get answers ranked by the community and discuss those answers through chat.";

  let homeUrl = "";

  if (process.env.NODE_ENV === "development") {
    homeUrl = `${process.env.NEXT_PUBLIC_DEV_URL}`;
  } else {
    homeUrl = `${process.env.NEXT_PUBLIC_PROD_URL}`;
  }

  // const homeUrl = process.env.NEXTAUTH_URL;

  let pageUrl = homeUrl;
  let pageTitle = "Poldit";

  if (description) {
    pageUrl = `${homeUrl}/Polls/${url}`;
    pageTitle = "Poll Question";
  }

  return (
    <>
      <NextSeo
        title={title}
        description={description ? description : defaultDesc}
        canonical={homeUrl}
        openGraph={{
          url: pageUrl,
          title: pageTitle,
          description: description ? description : defaultDesc,
          images: [
            {
              url: "https://res.cloudinary.com/rahmad12/image/upload/v1624921500/PoldIt/App_Imgs/PoldIt_logo_only_agkhlf.png",
              width: 800,
              height: 600,
              alt: "Og Image Alt",
              type: "image/jpeg",
            },
            {
              url: "https://res.cloudinary.com/poldit/image/upload/v1631379964/PoldIt/App_Imgs/Poldit_Logo_w8ln2f.png",
              width: 900,
              height: 800,
              alt: "Og Image Alt Second",
              type: "image/jpeg",
            },
            {
              url: "https://res.cloudinary.com/poldit/image/upload/v1631379964/PoldIt/App_Imgs/Poldit_Logo_w8ln2f.png",
            },
            {
              url: "https://res.cloudinary.com/poldit/image/upload/v1631379964/PoldIt/App_Imgs/Poldit_Logo_w8ln2f.png",
            },
          ],
          site_name: "Poldit",
        }}
        twitter={{
          handle: "@poldit",
          site: "@poldit.com",
          cardType: "summary_large_image",
        }}
      />
    </>
  );
};

export default Metadata;
