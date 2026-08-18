/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["better-sqlite3"],
  // T27: fonts never change → immutable; imagery may be replaced in place → 1 day + SWR week
  async headers() {
    const day = "public, max-age=86400, stale-while-revalidate=604800";
    return [
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: day }] },
      { source: "/design/:path*", headers: [{ key: "Cache-Control", value: day }] },
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: day }] },
      { source: "/icons/:path*", headers: [{ key: "Cache-Control", value: day }] },
      { source: "/uploads/:path*", headers: [{ key: "Cache-Control", value: day }] },
      { source: "/audio-sample/:path*", headers: [{ key: "Cache-Control", value: day }] },
    ];
  },
};
export default nextConfig;
