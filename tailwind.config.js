/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark': '#0d0d0d',
        'blood': '#2e1a1a',
        'neon': '#00ff88',
        'card': '#1a1a1a',
        'accent': '#ff6b6b'
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'flicker': 'flicker 1.5s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 1s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out'
      },
      keyframes: {
        glow: {
          'from': { 
            'box-shadow': '0 0 10px #00ff88, 0 0 20px #00ff88' 
          },
          'to': { 
            'box-shadow': '0 0 20px #00ff88, 0 0 30px #00ff88, 0 0 40px #00ff88' 
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        flicker: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.8' },
          '100%': { opacity: '1' }
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(50px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      fontFamily: {
        'horror': ['Creepster', 'cursive'],
        'metal': ['Metal Mania', 'cursive'],
        'inscryption': ['Griffy', 'cursive']
      }
    },
  },
  plugins: [],
}