/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        "primary-color": "#d70000",
      },
      width: {
        "nav-logo": ["clamp(6rem, 12dvw, 8rem)"],
        "hero-foreground": ["clamp(24rem, 35dvw, 35rem)"],
      },
      fontFamily: {
        "alfa-slab-one": ["Alfa Slab One", "sans-serif"],
        "league-spartan": ["League Spartan Variable", "sans-serif"],
      },
      fontSize: {
        xs: ["clamp(12px, 1.5dvw, 14px)"],
        sm: ["clamp(16px, 2dvw, 18px)"],
        md: ["clamp(18px, 2dvw, 20px)"],
        lg: ["clamp(20px, 4dvw, 24px)"],
        "lg-title": ["clamp(22.4px, 3dvw, 32px)"],
      },
    },
  },
  plugins: [],
}
