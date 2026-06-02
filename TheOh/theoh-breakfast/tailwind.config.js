/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theoh: {
          cream: "#FFFDF9",
          beige: "#FBF7F0",
          brown: "#5C3D20",
          orange: "#004700",
          primary: "#004700",
          softOrange: "#E8894A",
          lightOrange: "#FFF0E0",
          green: "#5C8A4A",
          muted: "#9E8C7A",
          border: "#E8D9C4",
          text: "#2D1F0E",
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
