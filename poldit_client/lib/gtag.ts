// export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  window.gtag("config" as any, process.env.NEXT_PUBLIC_GA_ID as string, {
    page_path: url,
  });
};

interface eventObj {
  action: string;
  category: string;
  label: string;
  value: string;
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: eventObj) => {
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
