import type { Config } from "@tailwindcss/tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "fade-in-up": "fadeInUp 0.7s ease-out",
        "scale-in": "scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "slide-in-right": "slideInRight 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.6s ease-out",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(219, 77, 146, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(219, 77, 146, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      transitionDuration: {
        "350": "350ms",
        "400": "400ms",
      },
      boxShadow: {
        "aegis-sm": "0 8px 24px rgba(93, 14, 59, 0.08)",
        "aegis-md": "0 16px 40px rgba(93, 14, 59, 0.12)",
        "aegis-lg": "0 24px 64px rgba(93, 14, 59, 0.16)",
        "aegis-xl": "0 32px 80px rgba(93, 14, 59, 0.2)",
      },
      backdropBlur: {
        "xs": "2px",
      },
    },
  },
  plugins: [],
};
export default config;
