/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5", // indigo-600
        accent: "#22c55e",  // green-500
        background: "#f9fafb",
        surface: "#ffffff",
        muted: "#9ca3af",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif","system-ui"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 4px 12px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [
     require("tailwind-scrollbar"),
  ],
};
