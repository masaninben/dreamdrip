/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        deep: {
          night: '#02030a',
          blue: '#061434',
          mid: '#0a2552',
        },
        glow: {
          DEFAULT: '#6db8ff',
          soft: '#a4d4ff',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Hiragino Sans',
          'Hiragino Kaku Gothic ProN',
          'Noto Sans JP',
          'system-ui',
          'sans-serif',
        ],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(6px, -10px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        starTwinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        drift: 'drift 9s ease-in-out infinite',
        ripple: 'ripple 1.6s ease-out forwards',
        glowPulse: 'glowPulse 4s ease-in-out infinite',
        starTwinkle: 'starTwinkle 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
