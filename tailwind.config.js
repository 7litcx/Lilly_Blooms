/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rose: {
          50: '#FDF6F7',
          100: '#FCECEF',
          200: '#F7D6DC',
          300: '#EEB5BF',
          400: '#DE8E9E',
          500: '#C97A8B', // primary brand color
          600: '#B8697A',
          700: '#9E4F63',
          800: '#7F3C4D',
          900: '#642E3B',
        },
        warm: {
          50: '#FDFCFB',
          100: '#FAF6F4',
          200: '#F5ECE7',
          300: '#EDE0D9',
          400: '#DECBC2',
          500: '#C9B3A8',
        },
        plum: {
          800: '#4D2C34',
          900: '#331B22',
          950: '#231116',
        }
      },
      fontFamily: {
        sans: ['"Thmanyah Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Thmanyah Serif Display"', '"Thmanyah Serif Text"', 'serif'],
        display: ['"Thmanyah Serif Display"', 'serif'],
        script: ['"Thmanyah Serif Display"', 'cursive', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(184, 105, 122, 0.08)',
        'soft-lg': '0 10px 30px -4px rgba(184, 105, 122, 0.12)',
        'rose-glow': '0 0 35px rgba(201, 122, 139, 0.25)',
      },
      borderRadius: {
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
}
