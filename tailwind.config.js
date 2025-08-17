/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern Inscryption palette
        'dark': '#0f0f0f',
        'darker': '#080808',
        'blood': '#2a1810',
        'wood': '#3a2817',
        'gold': '#d4af37',
        'gold-light': '#e6c866',
        'bone': '#f5f1e8',
        'green': '#00cc7a',
        'fire': '#ff6b35',
        'fire-light': '#ff8c5a',
        'accent': '#ff4757',
        'card': '#1a1a1a'
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
        'mono': ['Source Code Pro', 'monospace'],
        'display': ['Playfair Display', 'serif']
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'flicker': 'flicker 1.5s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.8s ease-out'
      },
      keyframes: {
        glow: {
          '0%': { 
            filter: 'drop-shadow(0 0 5px rgba(0, 204, 122, 0.3))'
          },
          '100%': { 
            filter: 'drop-shadow(0 0 15px rgba(0, 204, 122, 0.6))'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
      }
    },
  },
  plugins: [],
}