import { SITE } from "@/data/site";
import image from "@/assets/hero-capetown.jpg";

export function pageSeo(title: string, description: string, path: string) {
  const url = `${SITE.url}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: SITE.name },
      { property: "og:locale", content: "en_ZA" },
      { property: "og:image", content: `${SITE.url}${image}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: `${SITE.url}${image}` },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
