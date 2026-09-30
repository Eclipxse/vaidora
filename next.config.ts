import type { NextConfig } from "next";
const config: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "@napi-rs/canvas",
    "sharp",
    "exceljs",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      { pathname: "/**", search: "" },
      { pathname: "/display/**", search: "?v=contour-2" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
