/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        green: "#1db954",
        black: "#191414",
        primary: "#FFF",
        gray: "#535353",
        secondary: "#b3b3b3",
        "light-black": "#232323",
      },
      gridTemplateColumns:{
        'auto-fill-cards':'repeat(auto-fill,minmax(200px,1fr))',
      },
    },
  },
  plugins: [],
};
