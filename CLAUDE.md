# time-map

timezones.live — SEO timezone site (real-time map with live presence). Next + Convex + MapLibre + PostHog (project **317524**, personal org — use `phog personal`). Personal lane (`ctx personal`).

## Deploy
Push to `main` → Vercel git integration builds. **git push IS the deploy** — no Vercel CLI or MCP is wired here.

## Decisions (don't re-litigate)
- `/time/[slug]` is fully static (`revalidate = false`) — decided 2026-07-13. Daily ISR had crawlers re-triggering Node renders across ~1000 pages, 60% of James's all-project Vercel compute. Pages derive entirely from the static city dataset; the live clock is a client component. Keep them static.
- Accepted quirk: the DST-FAQ year in `city-page.tsx` comes from build-time `new Date()` and freezes until redeploy — only matters across a Jan-1 rollover.

## Facts
- City data = flat `timezoneCities` array in `src/lib/timezones.ts`, grouped by UTC offset west→east. `generateStaticParams` in `src/app/time/[slug]/page.tsx` prebuilds ~139 city + ~870 comparison slugs (30 hub cities). Adding a non-hub city = +1 page only, no comparison-slug blowup.
- Gotcha: `x-nextjs-stale-time: 300` is the client Router-Cache hint, NOT an ISR/stale-build signal — it persists with `revalidate=false`. The real static tell is `x-vercel-cache: PRERENDER`/`HIT` plus `● SSG` in build output.
