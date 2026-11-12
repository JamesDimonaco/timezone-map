# time-map

timezones.live: an SEO timezone site with a real-time map and live presence. The goal is to get the
static `/time/*` city and comparison pages indexed, then run AdSense on them. The homepage map is
the brand, not an SEO asset.

## Stack and commands

- Next.js 16, React 19, Convex (live presence only), MapLibre, Tailwind 4, PostHog. pnpm.
- `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test` (vitest).

## Where things live

- Identity lane: personal.
- Vercel project `timezone-map` (timezones.live). Push to `main` deploys via the git integration.
  The Vercel CLI is installed: `vercel logs`, `vercel inspect <url> --logs`.
- Convex: dev `silent-elk-841`, prod `quick-jay-120`. The Vercel build does not run
  `convex deploy`, so ship Convex function changes with `npx convex deploy`.
- PostHog project 317524. Query with `phog personal 317524 "<HogQL>"`.
- Env: `.env.local`. `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`,
  `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `NEXT_PUBLIC_ADSENSE_SLOT` (empty means
  `AdBanner` renders nothing).
- City data: the flat `timezoneCities` array in `src/lib/timezones.ts`, grouped by UTC offset
  west to east. `generateStaticParams` in `src/app/time/[slug]/page.tsx` prebuilds every city slug
  plus comparison slugs against the hubs in `src/lib/major-hubs.ts`. A non-hub city adds one page.

## Decisions (don't re-litigate)

- `/time/[slug]` is fully static (`revalidate = false`), decided 2026-07-13. Daily ISR had crawlers
  re-rendering ~1000 pages, 60% of James's Vercel compute. The live clock is a client component.
- Homepage (`src/components/home-tabs.tsx`) is a tabbed `[Convert | Map]` shell. Convert is the
  default on mobile, Map on desktop. Deep links (`?compare`, `?city`, `?lat`, `?lng`) force Map.
  The map mounts lazily so Convert users skip MapLibre and the 568 KB `timezones.json`.
- QuickConvert (`src/components/quick-convert.tsx`) is the most-used feature and the Convert hero.
- Accepted quirk: the DST FAQ year in `city-page.tsx` comes from build-time `new Date()`.

## Gotchas

- `x-nextjs-stale-time: 300` is the client Router Cache hint, not an ISR signal. The real static
  tell is `x-vercel-cache: PRERENDER`/`HIT` and `● SSG` in build output.
- ESLint flags `react-hooks/set-state-in-effect` in many files. It is a pre-existing,
  hydration-safe pattern and `next build` is unaffected.
