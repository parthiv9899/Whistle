import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design token colors
        primary: {
          DEFAULT: '#3b49ff',
          hover: '#4e5aff',
          active: '#2938e6',
        },
        background: '#0f1115',
        surface: {
          DEFAULT: '#121316',
          hover: '#1a1b1f',
        },
        text: {
          DEFAULT: '#e6eef8',
          muted: '#9aa0a6',
          dim: '#6b7280',
        },
        border: {
          DEFAULT: '#1f2128',
          hover: '#2a2c34',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      spacing: {
        'nav': '260px',
        'rail': '320px',
      },
      borderRadius: {
        'sm': '6px',
        'base': '10px',
        'lg': '14px',
        'xl': '20px',
      },
      boxShadow: {
        'card': '0 6px 20px rgba(2, 6, 23, 0.6)',
        'card-hover': '0 10px 30px rgba(2, 6, 23, 0.8)',
        'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Inter"', '"Roboto"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"SF Mono"', '"Fira Code"', '"Consolas"', 'monospace'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '22px',
        '2xl': '28px',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
    },
  },
  plugins: [],
};

export default config;
