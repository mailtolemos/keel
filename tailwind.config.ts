import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Keel palette: navy, graphite, off-white + single accent (indigo)
        navy: {
          DEFAULT: "#0D0E24",
          50: "#F5F5FB", 100: "#E7E8F3", 200: "#C9CBE0",
          600: "#24264A", 700: "#191A39", 800: "#111228", 900: "#0D0E24"
        },
        graphite: {
          DEFAULT: "#5A6072",
          50: "#F6F7F9", 100: "#ECEEF2", 200: "#DDE1E8",
          300: "#C4CAD4", 400: "#9AA1B0", 500: "#6B7280",
          600: "#4B5160", 700: "#373C49", 800: "#262A33", 900: "#171A21"
        },
        paper: "#FBFBFC",
        accent: {
          DEFAULT: "#4E2BD6", 50: "#EFEBFD", 100: "#DDD4FB",
          400: "#8466EE", 500: "#6645E6", 600: "#4E2BD6", 700: "#3F22AD"
        },
        good: "#15803D", warn: "#B45309", bad: "#B91C1C"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"]
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.01em" }],
        sm: ["0.8125rem", { lineHeight: "1.15rem" }]
      },
      borderRadius: { lg: "10px", xl: "14px" },
      boxShadow: {
        card: "0 1px 2px rgba(13,14,36,0.04), 0 1px 3px rgba(13,14,36,0.06)",
        pop: "0 8px 28px rgba(13,14,36,0.12)",
        focus: "0 0 0 3px rgba(78,43,214,0.18)"
      }
    }
  },
  plugins: []
};
export default config;
