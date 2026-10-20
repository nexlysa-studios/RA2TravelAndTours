import { BLOG_POSTS } from "./blog";

// Only index public pages that resolve to useful content.
export const PUBLIC_PATHS = [
  "/",
  "/packages",
  "/cape-peninsula-tour",
  "/cape-town-city-tour",
  "/stellenbosch-wine-tour",
  "/fleet",
  "/gallery",
  "/blog",
  ...BLOG_POSTS.map((post) => `/blog/${post.slug}`),
];

// Common bookmarks have explicit destinations; unknown URLs remain real 404s.
export const PAGE_ALIASES: Record<string, string> = {
  "/home": "/",
  "/index.html": "/",
  "/tours": "/packages",
  "/experiences": "/packages",
  "/about": "/#about",
  "/about-us": "/#about",
  "/contact": "/#book",
  "/contact-us": "/#book",
  "/airport-transfers": "/#transfers",
  "/cape-winelands": "/stellenbosch-wine-tour",
};
