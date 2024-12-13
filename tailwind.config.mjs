/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
      colors: {
        'primary-color': '#d70000',
      },
      width: {
        'nav-logo': ['clamp(5rem, 12dvw, 6.5rem)'],
        'hero-foreground': ['clamp(22rem, 50dvw, 30rem)'],  
      },
      fontFamily: {
        'alfa-slab-one': ['Alfa Slab One', 'sans-serif'],
        'league-spartan': ['League Spartan Variable', 'sans-serif'],
      },
      fontSize: {
        'lg-title': ['clamp(1.3rem, 2.5dvw, 2rem)'],
        sm: ['clamp(1rem, 2dvw, 1.250rem)'], 
        xs: ['clamp(0.75rem, 1.5dvw, 0.875rem)'],
      }
    },
	},
	plugins: [],
}
