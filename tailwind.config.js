/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        black: {
          DEFAULT: '#050505',
          50: '#0a0a0a',
          100: '#111111',
          200: '#1a1a1a',
          300: '#222222',
          400: '#2a2a2a',
        },
        navy: {
          DEFAULT: '#081018',
          light: '#0d1825',
        },
        charcoal: {
          DEFAULT: '#111111',
          light: '#1a1a1a',
        },
        offwhite: {
          DEFAULT: '#F5F3EA',
          dark: '#E8E5D8',
        },
        orange: {
          DEFAULT: '#FF7A00',
          hover: '#FF8F1F',
          dark: '#CC6200',
          50: '#FFF3E6',
          100: '#FFE0B2',
          500: '#FF7A00',
          600: '#CC6200',
        },
        gold: {
          DEFAULT: '#FFC928',
          dark: '#E6B400',
          light: '#FFD966',
        },
        gray: {
          muted: '#8E8E8E',
          border: '#2A2A2A',
          surface: '#161616',
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'Sora', 'Manrope', 'sans-serif'],
        body: ['Inter', '"DM Sans"', 'Manrope', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
        'display-2xl': ['clamp(3rem, 8vw, 8rem)', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
        'display-xl': ['clamp(2.5rem, 6vw, 6rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2rem, 4vw, 4.5rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(1.5rem, 3vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
      },
      letterSpacing: {
        'ultra-wide': '0.25em',
        'widest': '0.2em',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-in-left': 'slideInLeft 0.5s ease-out both',
        'slide-in-right': 'slideInRight 0.5s ease-out both',
        'wave': 'wave 1.5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'marquee': 'marquee 20s linear infinite',
        'player-appear': 'playerAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        playerAppear: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(255, 122, 0, 0.3)',
        'glow-gold': '0 0 20px rgba(255, 201, 40, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
        'player': '0 -4px 40px rgba(0, 0, 0, 0.8)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
};
