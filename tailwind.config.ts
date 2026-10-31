import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        erp: {
          blue: "#2b7de9",
          blueDark: "#1b5cb8",
          blueLight: "#e9f2fd",
          header: "#f3f4f6",
          border: "#cbd5e1",
          borderDark: "#94a3b8",
          bg: "#ffffff",
          gridHeader: "#e5e9f0",
          gridHover: "#f1f5f9",
          gridSelected: "#dbeafe",
          sidebar: "#f8fafc",
        },
      },
      fontSize: {
        '2xs': '10px',
        'xs': '11px',
        'sm': '12px',
        'base': '13px',
      },
    },
  },
  plugins: [],
};
export default config;

