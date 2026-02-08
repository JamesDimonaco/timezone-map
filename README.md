# Time Map

An interactive world timezone map built with Next.js. Explore 60+ cities across every major timezone with a full-screen, color-coded map -- no API keys required.

![Time Map Screenshot](screenshot-placeholder.png)

---

## Features

- **Full-screen interactive map** powered by MapLibre GL with free CARTO basemap tiles
- **60+ city markers** spanning all major timezones, color-coded by UTC offset
- **Country timezone shading** -- countries are filled by their actual timezone, reflecting real-world boundaries rather than straight vertical lines
- **Timezone boundary lines** drawn as dashed overlays across the map
- **Click any marker** to view a popup with live local time, date, UTC offset, and a comparison to your local time
- **Hover a country** to highlight every country sharing that same timezone
- **City search bar** for quick lookup
- **Timezone time labels** pinned to the bottom of the screen, positioned between boundary lines
- **Geolocation** with a pulsing blue dot showing your current position
- **Toggle city markers** on or off for a cleaner view
- **Dark / light theme** that follows your system preference automatically
- **Map controls** for zoom, locate-me, and fullscreen

## Getting Started

### Prerequisites

- Node.js 18+

### Install

```bash
git clone <repo-url>
cd time-map
npm install
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| UI Components | [shadcn/ui](https://ui.shadcn.com) |
| Map | [MapLibre GL](https://maplibre.org) via [mapcn](https://mapcn.dev) |
| Basemap Tiles | [CARTO](https://carto.com) (free, no API key) |
| Country Boundaries | [TopoJSON](https://github.com/topojson/topojson-client) (`world-110m`) |
| Icons | [Lucide React](https://lucide.dev) |

## License

MIT
