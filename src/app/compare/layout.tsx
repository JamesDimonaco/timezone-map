import { AdSenseScript } from "@/components/adsense-script";

export default function CompareLayout({
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
