import { ImageResponse } from "next/og";

export const alt = "SearchProof white-label monthly SEO report with sessions, clicks, and conversions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f1f5f9",
          padding: "56px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "space-between",
            paddingRight: "40px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 22, color: "#0f766e", fontWeight: 700, letterSpacing: 2 }}>
              SEARCHPROOF
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 58,
                fontWeight: 700,
                color: "#0f172a",
                lineHeight: 1.05,
                marginTop: 18,
                maxWidth: 620,
              }}
            >
              White-label monthly SEO reports
            </div>
            <div style={{ display: "flex", fontSize: 24, color: "#475569", marginTop: 18, maxWidth: 540 }}>
              Work log, GA4, and Search Console in a branded PDF.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 20, color: "#64748b" }}>getsearchproof.com</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 360,
            background: "#0f766e",
            borderRadius: 24,
            padding: 32,
            color: "white",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, letterSpacing: 1 }}>
            <span>MONTHLY SEO REPORT</span>
            <span>SAMPLE</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 14, opacity: 0.75 }}>SESSIONS</span>
              <span style={{ fontSize: 42, fontWeight: 700 }}>3,842</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 14, opacity: 0.75 }}>CLICKS</span>
              <span style={{ fontSize: 42, fontWeight: 700 }}>1,904</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 14, opacity: 0.75 }}>CONVERSIONS</span>
              <span style={{ fontSize: 42, fontWeight: 700 }}>47</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
