export const SITE_URL = "https://lefa-connect.com";
export const SITE_NAME = "Lefa Connect";
export const DEFAULT_TITLE =
  "Lefa Connect | Livestock, Membership & Agricultural Community Platform";
export const DEFAULT_DESCRIPTION =
  "Lefa Connect is a modern agricultural membership and livestock platform connecting members, managing contributions, operations, livestock and community participation in one secure digital platform.";
export const SOCIAL_IMAGE = "/lc%20logo3.jpg";

export function publicSeoHead(title: string, description: string, path: string) {
  const canonical = `${SITE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "author", content: SITE_NAME },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:image", content: `${SITE_URL}${SOCIAL_IMAGE}` },
      {
        property: "og:image:alt",
        content: "Lefa Connect livestock and agricultural community mark",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: `${SITE_URL}${SOCIAL_IMAGE}` },
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}

export function privateSeoHead(title: string) {
  return {
    meta: [{ title }, { name: "robots", content: "noindex, nofollow, noarchive" }],
  };
}
