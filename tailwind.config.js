/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#1A1D21',
        foreground: '#FFFFFF',
        card: '#1F242C',
        'card-foreground': '#FFFFFF',
        popover: '#1F242C',
        'popover-foreground': '#FFFFFF',
        primary: {
          DEFAULT: '#6366F1',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#2A303A',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#374151',
          foreground: '#9CA3AF',
        },
        accent: {
          DEFAULT: '#2A303A',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        border: '#374151',
        input: '#2A303A',
        ring: '#6366F1',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    require('tailwindcss-animate'),
  ],
} 