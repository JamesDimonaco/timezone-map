import Link from "next/link";
import { Globe } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <Globe className="size-12 text-muted-foreground/40" />
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist. Try the interactive
          timezone map instead.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Go to Time Map
      </Link>
    </div>
  );
}
