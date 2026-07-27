import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Silent Shift design tokens
        bg: "#0A0A0A",
        surface: "#171717",
        border: {
          DEFAULT: "#262626",
          medium: "#52525B",
          secondary: "#A1A1AA",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#A1A1AA",
          tertiary: "#52525B",
        },
        brand: {
          DEFAULT: "#D4AF37",
          hover: "#C49B2F",
          on: "#000000",
        },
        // Semi-transparent overlays
        overlay: {
          soft: "rgba(255,255,255,0.2)",
          card: "rgba(23,23,23,0.6)",
          chip: "rgba(245,245,245,0.15)",
          glow: "rgba(255,255,255,0.1)",
          "glow-strong": "rgba(255,255,255,0.3)",
        },
      },
      fontFamily: {
        sans: ["IRANYekanXFaNum", "Tahoma", "Arial", "sans-serif"],
      },
      fontSize: {
        // Desktop scale
        "d-h1": ["48px", { lineHeight: "60px", fontWeight: "700" }],
        "d-h2": ["36px", { lineHeight: "44px", fontWeight: "600" }],
        "d-h3": ["30px", { lineHeight: "38px", fontWeight: "600" }],
        "d-h4": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "d-h5": ["20px", { lineHeight: "28px", fontWeight: "500" }],
        "d-body-lg": ["20px", { lineHeight: "32px", fontWeight: "400" }],
        "d-body-md": ["16px", { lineHeight: "28px", fontWeight: "400" }],
        "d-body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "d-button": ["16px", { lineHeight: "24px", fontWeight: "500" }],
        // Mobile overrides
        "m-h1": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "m-h2": ["28px", { lineHeight: "36px", fontWeight: "600" }],
        "m-h4": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "m-body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "m-h6": ["16px", { lineHeight: "24px", fontWeight: "400" }],
      },
      spacing: {
        "page-x-d": "120px",
        "page-x-m": "24px",
        "section-d": "48px",
        "section-m": "24px",
        "col-gap": "112px",
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "4px",
        md: "8px",
        lg: "16px",
        xl: "24px",
        full: "9999px",
      },
      maxWidth: {
        phone: "412px",
        page: "1440px",
        footer: "1200px",
        content: "720px",
      },
      backdropBlur: {
        card: "9px",
        email: "40px",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(10,13,18,0.05)",
      },
      keyframes: {
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-right 200ms ease-out",
        "fade-in": "fade-in 200ms ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
