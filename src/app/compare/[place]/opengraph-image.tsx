import { ImageResponse } from "next/og";
import { parsePlaceSlug, placeLabel } from "@/lib/share-time";
import { countryFlag, timezoneColors } from "@/lib/timezones";

export const alt = "Compare this time with yours";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ place: string }> }) {
  const place = parsePlaceSlug((await params).place);
  const label = place ? placeLabel(place) : "UTC";
  const color = (place?.kind === "city" && timezoneColors[place.city.utcOffset]) || "#60a5fa";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          borderTop: `6px solid ${color}`,
          borderBottom: `6px solid ${color}`,
        }}
      >
        {place?.kind === "city" && (
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>{countryFlag(place.city.country)}</div>
        )}
        <div style={{ fontSize: "60px", fontWeight: 700, color: "#ffffff", marginBottom: "16px" }}>
          {`${label} time`}
        </div>
        <div style={{ fontSize: "34px", color, marginBottom: "28px" }}>Compare with yours</div>
        <div style={{ fontSize: "20px", color: "#71717a" }}>timezones.live</div>
      </div>
    ),
    { ...size },
  );
}
