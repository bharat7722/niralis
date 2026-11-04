import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the monogram on the site's paper colour. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fdf9f4",
          color: "#6d2734",
          fontSize: 64,
          letterSpacing: 2,
        }}
      >
        <span>H</span>
        <span style={{ color: "#d5a13c", margin: "0 10px" }}>&</span>
        <span>N</span>
      </div>
    ),
    size,
  );
}
