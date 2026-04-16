import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t mt-12">
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} Timezones.live</span>
        <nav className="flex items-center gap-4">
          <Link
            href="/about"
            className="hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/api/docs"
            className="hover:text-foreground transition-colors"
          >
            API
          </Link>
        </nav>
      </div>
    </footer>
  );
}
