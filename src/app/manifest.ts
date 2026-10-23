import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Velence Resort & Spa",
    short_name: "Velence Spa",
    description: "Családbarát wellness szálloda a Velencei-tó partján – Family-friendly wellness hotel on Lake Velence",
    start_url: "/",
    display: "standalone",
    background_color: "#fcfbf8",
    theme_color: "#1a4d72",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
