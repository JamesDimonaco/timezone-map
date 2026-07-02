import { AdSenseScript } from "@/components/adsense-script";

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdSenseScript />
      {children}
    </>
  );
}
