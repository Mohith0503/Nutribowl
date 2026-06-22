/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nutribowl: {
          cream: "var(--card)",
          beige: "var(--background)",
          brown: "var(--text)",
          orange: "var(--primary)",
          primary: "var(--primary)",
          softOrange: "var(--accent)",
          lightOrange: "var(--secondary)",
          green: "var(--accent)",
          muted: "var(--muted)",
          border: "var(--border)",
          text: "var(--text)",
        }
      },
      fontFamily: {
        sans: ["'Outfit'", "'Plus Jakarta Sans'", "sans-serif"],
      },
      boxShadow: {
        'premium': '0 8px 30px rgba(92, 61, 32, 0.06)',
        'premium-hover': '0 12px 40px rgba(92, 61, 32, 0.12)',
        'floating': '0 10px 32px rgba(0, 71, 0, 0.18)',
      }
    },
  },
  plugins: [],
}
