/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Paleta de colores del proyecto (proporcionada por el equipo) */
        brand: {
          white: "#FFFFFF",
          yellow: "#FEC000",
          cyan: "#009DCD",
          navy: "#052845",
          gray: "#8b8b8b",
        },
        primary: {
          50: "rgba(0, 157, 205, 0.08)",
          100: "rgba(0, 157, 205, 0.14)",
          200: "rgba(0, 157, 205, 0.24)",
          300: "rgba(0, 157, 205, 0.38)",
          500: "#009DCD",
          600: "#009DCD",
          700: "#052845",
          800: "#052845",
          900: "#052845",
          DEFAULT: "#009DCD",
        },
        accent: {
          50: "rgba(254, 192, 0, 0.12)",
          100: "rgba(254, 192, 0, 0.22)",
          500: "#FEC000",
          600: "#FEC000",
          700: "#052845",
          DEFAULT: "#FEC000",
        },
        secondary: {
          600: "#052845",
          700: "#052845",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
