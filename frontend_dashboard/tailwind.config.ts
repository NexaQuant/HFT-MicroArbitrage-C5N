import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // or 'media' if you prefer OS-level dark mode
  theme: {
    extend: {
      // We can extend the theme here for cyberpunk styles later
      // For example, colors, fonts, etc.
      colors: {
        // 保留用户自定义的 cyberpunk 风格颜色
        'cyber-bg': '#0d0221',
        'cyber-text': '#c0fefc',
        'cyber-primary': '#f925dc',
        'cyber-secondary': '#701ff5',
        'cyber-accent': '#00f5d4',
        // 添加一些通用的灰阶颜色，方便与 dark:bg-gray-800 等类名配合
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        // Add custom fonts if needed for cyberpunk style
        // 'sans': ['Orbitron', 'sans-serif'], // Example
      },
    },
  },
  plugins: [],
};
export default config;