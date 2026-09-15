import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { getProfile } from "@/lib/data";
import { siteUrl } from "@/lib/profile";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/public";
import { Motion } from "@/components/motion";
import "./globals.css";
import "./redesign.css";
export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const p = await getProfile();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: p.seoTitle, template: `%s | ${p.name}` },
    description: p.seoDescription,
    icons: { icon: "/icon.svg" },
    openGraph: {
      type: "website",
      title: p.seoTitle,
      description: p.seoDescription,
      ...(p.ogImage ? { images: [p.ogImage] } : {}),
    },
    twitter: { card: "summary_large_image" },
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const p = await getProfile();
  return (
    <html lang="en">
      <body id="top">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navigation name={p.name} />
        <main id="main">{children}</main>
        <Footer profile={p} />
        <Motion />
        <Analytics />
      </body>
    </html>
  );
}
