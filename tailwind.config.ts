import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Covers if you use 'src' folder
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Covers if you DON'T use 'src' folder (Root)
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
