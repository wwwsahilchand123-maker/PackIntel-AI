import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050810',
        surface: 'rgba(255,255,255,0.04)',
        'neon-cyan': '#00D4FF',
        'neon-violet': '#7B2FFF',
        'neon-green': '#00FF9D',
        'neon-amber': '#FFB800',
        'neon-red': '#FF3D3D',
        'text-primary': '#F0F4FF',
        'text-secondary': '#8B95B0',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 212, 255, 0.3)',
        'neon-violet': '0 0 20px rgba(123, 47, 255, 0.3)',
        'neon-green': '0 0 20px rgba(0, 255, 157, 0.3)',
        'neon-amber': '0 0 20px rgba(255, 184, 0, 0.3)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
