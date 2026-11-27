/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cu: {
          bg: '#EDEDE9',          // Main background
          card: '#F5EBE0',        // Primary card surface
          secondary: '#D6CCC2',   // Secondary surface
          border: '#E3D5CA',      // Borders
          accent: '#D5BDAF',      // Accent
          dark: '#292724',        // Primary action & dark accents
          darkHover: '#1C1A18',
          glass: 'rgba(245, 235, 224, 0.68)',
          glassBorder: 'rgba(255, 255, 255, 0.55)',
          text: {
            main: '#292724',      // Primary text
            muted: '#77716A',     // Secondary text
            subtle: '#A19A91',    // Muted text
          },
          hover: 'rgba(245, 235, 224, 0.85)',
          active: '#C7ADA0',
          success: '#4E7259',     // Muted earthy sage green
          successLight: 'rgba(78, 114, 89, 0.12)',
          warning: '#A86832',     // Earthy terracotta
          warningLight: 'rgba(168, 104, 50, 0.12)',
          info: '#4B6B7F',        // Muted slate
          infoLight: 'rgba(75, 107, 127, 0.12)',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 30px rgba(75, 60, 45, 0.07)',
        'glass-md': '0 12px 36px rgba(75, 60, 45, 0.09), 0 2px 6px rgba(75, 60, 45, 0.04)',
        'glass-lg': '0 20px 48px rgba(75, 60, 45, 0.11), 0 4px 12px rgba(75, 60, 45, 0.05)',
        'soft': '0 2px 10px -2px rgba(41, 39, 36, 0.04), 0 4px 18px -2px rgba(41, 39, 36, 0.03)',
        'soft-md': '0 4px 18px -2px rgba(41, 39, 36, 0.06), 0 8px 26px -4px rgba(41, 39, 36, 0.04)',
        'soft-lg': '0 14px 34px -4px rgba(41, 39, 36, 0.08), 0 6px 18px -4px rgba(41, 39, 36, 0.03)',
      },
      borderRadius: {
        'card': '1.25rem',
        'glass': '1.25rem',
        'badge': '9999px',
      }
    },
  },
  plugins: [],
}
