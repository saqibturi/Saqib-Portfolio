import { siteUrl } from "@/lib/profile";
export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/login", "/auth/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
