import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      usm: { min: "350px" },
    },
    extend: {},
  },
  plugins: [],
} satisfies Config;
