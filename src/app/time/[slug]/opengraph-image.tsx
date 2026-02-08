import { ImageResponse } from "next/og";
import { getCityBySlug, parseComparisonSlug, formatHourDifference } from "@/lib/slugs";
import { timezoneColors, countryFlag, getHourDifference } from "@/lib/timezones";

export const runtime = "edge";
export const alt = "Timezone information";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Try city page
  const city = getCityBySlug(slug);
  if (city) {
    const color = timezoneColors[city.utcOffset] ?? "#60a5fa";
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#0a0a0a",
            position: "relative",
          }}
        >
          {/* Top accent */}
          <div style={{ width: "100%", height: "6px", backgroundColor: color }} />

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 80px",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>
              {countryFlag(city.country)}
            </div>
            <div
              style={{
                fontSize: "52px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-1px",
                marginBottom: "12px",
                textAlign: "center",
              }}
            >
              {city.name}, {city.country}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  padding: "8px 24px",
                  borderRadius: "9999px",
                  backgroundColor: `${color}30`,
                  border: `2px solid ${color}`,
                  color,
                  fontSize: "28px",
                  fontWeight: 600,
                }}
              >
                {city.utcOffset}
              </div>
            </div>
            <div style={{ fontSize: "20px", color: "#71717a" }}>
              timezones.live
            </div>
          </div>

          {/* Bottom accent */}
          <div style={{ width: "100%", height: "6px", backgroundColor: color }} />
        </div>
      ),
      { ...size }
    );
  }

  // Try comparison page
  const comparison = parseComparisonSlug(slug);
  if (comparison) {
    const { cityA, cityB } = comparison;
    const colorA = timezoneColors[cityA.utcOffset] ?? "#60a5fa";
    const colorB = timezoneColors[cityB.utcOffset] ?? "#60a5fa";
    const diff = getHourDifference(cityA.timezone, cityB.timezone);
    const diffText = formatHourDifference(diff);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#0a0a0a",
            position: "relative",
          }}
        >
          {/* Dual-color top accent */}
          <div style={{ display: "flex", width: "100%", height: "6px" }}>
            <div style={{ flex: 1, backgroundColor: colorA }} />
            <div style={{ flex: 1, backgroundColor: colorB }} />
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 60px",
            }}
          >
            {/* City names */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "4px" }}>
                  {countryFlag(cityA.country)}
                </div>
                <div style={{ fontSize: "36px", fontWeight: 700, color: "#ffffff" }}>
                  {cityA.name}
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    padding: "4px 16px",
                    borderRadius: "9999px",
                    backgroundColor: `${colorA}30`,
                    border: `2px solid ${colorA}`,
                    color: colorA,
                    fontSize: "20px",
                    fontWeight: 600,
                  }}
                >
                  {cityA.utcOffset}
                </div>
              </div>

              <div style={{ fontSize: "36px", color: "#52525b", fontWeight: 700 }}>to</div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "4px" }}>
                  {countryFlag(cityB.country)}
                </div>
                <div style={{ fontSize: "36px", fontWeight: 700, color: "#ffffff" }}>
                  {cityB.name}
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    padding: "4px 16px",
                    borderRadius: "9999px",
                    backgroundColor: `${colorB}30`,
                    border: `2px solid ${colorB}`,
                    color: colorB,
                    fontSize: "20px",
                    fontWeight: 600,
                  }}
                >
                  {cityB.utcOffset}
                </div>
              </div>
            </div>

            {/* Difference */}
            <div
              style={{
                padding: "12px 32px",
                borderRadius: "12px",
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#d4d4d8",
                fontSize: "28px",
                fontWeight: 600,
                marginBottom: "16px",
              }}
            >
              {diffText} difference
            </div>

            <div style={{ fontSize: "20px", color: "#71717a" }}>
              timezones.live
            </div>
          </div>

          {/* Dual-color bottom accent */}
          <div style={{ display: "flex", width: "100%", height: "6px" }}>
            <div style={{ flex: 1, backgroundColor: colorA }} />
            <div style={{ flex: 1, backgroundColor: colorB }} />
          </div>
        </div>
      ),
      { ...size }
    );
  }

  // Fallback
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#ffffff",
          fontSize: "48px",
          fontWeight: 700,
        }}
      >
        Timezones.live
      </div>
    ),
    { ...size }
  );
}
