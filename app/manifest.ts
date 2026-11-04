import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Harsh & Nirali — Forever Begins",
    short_name: "H & N",
    description: "Harsh & Nirali are getting married on 11 February 2027 at Sun Temple, Borsad.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf9f4",
    theme_color: "#fdf9f4",
    icons: [{ src: "/apple-icon", sizes: "180x180", type: "image/png" }],
  };
}
