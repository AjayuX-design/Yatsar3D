import type { MetadataRoute } from "next";
import { indexingOn, siteUrl } from "@/lib/site";

/** Closed until ALLOW_INDEXING=true. After that, public pages are open and private or internal ones are not. */
export default function robots(): MetadataRoute.Robots {
  if (!indexingOn()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/admin", "/search", "/preview"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
