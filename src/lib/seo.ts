import { SITE, type DetailedTour } from "@/data/site";
import image from "@/assets/hero-capetown.jpg";

type StructuredData = Record<string, unknown>;

type SeoOptions = {
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  breadcrumbs?: { name: string; path: string }[];
  schemas?: StructuredData[];
};

export const absoluteUrl = (path: string) => new URL(path, SITE.url).href;

export function canonicalUrl(path: string) {
  const pathname = new URL(path, SITE.url).pathname.replace(/\/+$/, "");
  return `${SITE.url}${pathname || "/"}`;
}

// Escape script delimiters even when future content comes from a CMS.
export const jsonLd = (data: StructuredData) => JSON.stringify(data).replace(/</g, "\\u003c");

export function pageSeo(
  title: string,
  description: string,
  path: string,
  options: SeoOptions = {},
) {
  const url = canonicalUrl(path);
  const preview = ["deploy-preview", "branch-deploy", "preview-server", "dev"].includes(
    import.meta.env.RA2_DEPLOY_CONTEXT || "",
  );
  const socialImage = absoluteUrl(options.image || image);
  const imageAlt = options.imageAlt || "Cape Town travel with RA2 Travel & Tours";
  const breadcrumbs = options.breadcrumbs || [{ name: title.split(" | ")[0], path }];
  const graph: StructuredData[] = [
    {
      "@type": "TravelAgency",
      "@id": `${SITE.url}/#business`,
      name: SITE.name,
      url: `${SITE.url}/`,
      description: SITE.description,
      image: absoluteUrl(image),
      telephone: SITE.phoneRaw,
      email: SITE.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: "10 Kestel Street, Plumstead",
        addressLocality: "Cape Town",
        addressRegion: "Western Cape",
        addressCountry: "ZA",
      },
      areaServed: [
        { "@type": "City", name: "Cape Town" },
        { "@type": "Country", name: "South Africa" },
      ],
      sameAs: [SITE.facebook, SITE.instagram],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: `${SITE.url}/`,
      name: SITE.name,
      inLanguage: "en-ZA",
      publisher: { "@id": `${SITE.url}/#business` },
    },
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: "en-ZA",
      isPartOf: { "@id": `${SITE.url}/#website` },
      about: { "@id": `${SITE.url}/#business` },
      primaryImageOfPage: { "@type": "ImageObject", url: socialImage },
      ...(path !== "/" && { breadcrumb: { "@id": `${url}#breadcrumbs` } }),
    },
    ...(path !== "/"
      ? [
          {
            "@type": "BreadcrumbList",
            "@id": `${url}#breadcrumbs`,
            itemListElement: [{ name: "Home", path: "/" }, ...breadcrumbs].map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              item: canonicalUrl(item.path),
            })),
          },
        ]
      : []),
    ...(options.schemas || []),
  ];

  return {
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "robots",
        content: preview ? "noindex, nofollow" : "index, follow, max-image-preview:large",
      },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: options.type || "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: SITE.name },
      { property: "og:locale", content: "en_ZA" },
      { property: "og:image", content: socialImage },
      { property: "og:image:alt", content: imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: socialImage },
      { name: "twitter:image:alt", content: imageAlt },
      ...(options.publishedTime
        ? [{ property: "article:published_time", content: options.publishedTime }]
        : []),
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: jsonLd({ "@context": "https://schema.org", "@graph": graph }),
      },
    ],
  };
}

export function tourSeo(
  tour: DetailedTour,
  title: string,
  description: string,
  path: string,
  image: string,
) {
  return pageSeo(title, description, path, {
    image,
    imageAlt: tour.title,
    breadcrumbs: [
      { name: "Experiences", path: "/packages" },
      { name: tour.title, path },
    ],
    schemas: [
      {
        "@type": "Service",
        "@id": `${canonicalUrl(path)}#service`,
        name: tour.title,
        description: tour.intro,
        url: canonicalUrl(path),
        image: absoluteUrl(image),
        serviceType: "Private guided tour",
        provider: { "@id": `${SITE.url}/#business` },
        areaServed: { "@type": "AdministrativeArea", name: "Western Cape, South Africa" },
      },
    ],
  });
}
