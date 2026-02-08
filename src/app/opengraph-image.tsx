import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Timezones.live — Explore every world timezone on a beautiful interactive map";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TIMEZONE_COLORS = [
  "#FF6B6B",
  "#FF8E53",
  "#FFC53D",
  "#95DE64",
  "#5CDBD3",
  "#69B1FF",
  "#9580FF",
  "#F759AB",
  "#FF7A45",
  "#BAE637",
  "#36CFC9",
  "#597EF7",
];

const FEATURES = [
  "Interactive Map",
  "All Time Zones",
  "UTC Offsets",
  "Instant Lookup",
];

export default function OgImage() {
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
          overflow: "hidden",
        }}
      >
        {/* Top color band */}
        <div style={{ display: "flex", width: "100%", height: "6px" }}>
          {TIMEZONE_COLORS.map((color, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: color,
              }}
            />
          ))}
        </div>

        {/* Main content */}
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
          {/* Globe icon */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              border: "3px solid #69B1FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "24px",
              fontSize: "36px",
            }}
          >
            🌍
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-1px",
              marginBottom: "16px",
            }}
          >
            Timezones.live
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "24px",
              color: "#a1a1aa",
              textAlign: "center",
              maxWidth: "700px",
              lineHeight: 1.4,
              marginBottom: "40px",
            }}
          >
            Explore every world timezone on a beautiful interactive map
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", gap: "12px" }}>
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 20px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#d4d4d8",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom color band */}
        <div style={{ display: "flex", width: "100%", height: "6px" }}>
          {TIMEZONE_COLORS.map((color, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: color,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
