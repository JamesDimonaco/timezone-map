import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "40px",
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Globe circle */}
          <circle cx="12" cy="12" r="10" stroke="#69B1FF" strokeWidth="1.2" fill="none" />
          {/* Horizontal equator */}
          <ellipse cx="12" cy="12" rx="10" ry="3.5" stroke="#69B1FF" strokeWidth="0.8" fill="none" />
          {/* Vertical meridian */}
          <ellipse cx="12" cy="12" rx="4" ry="10" stroke="#69B1FF" strokeWidth="0.8" fill="none" />
          {/* Center vertical line */}
          <line x1="12" y1="2" x2="12" y2="22" stroke="#69B1FF" strokeWidth="0.6" opacity="0.5" />
          {/* Center horizontal line */}
          <line x1="2" y1="12" x2="22" y2="12" stroke="#69B1FF" strokeWidth="0.6" opacity="0.5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
