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
        // Neon accents
        neon: {
          cyan: '#00FFF0',
          pink: '#FF00FF',
          purple: '#BD00FF',
          blue: '#0066FF',
        },
        // Dark backgrounds
        dark: {
          bg: '#050508',
          panel: '#0A0A14',
          circuit: '#121224',
        },
        // Glitch effects
        glitch: {
          yellow: '#FFD700',
          red: '#FF3333',
        },
        // Legacy (keeping for compatibility)
        burgundy: {
          DEFAULT: '#2D0A0F',
          500: '#2D0A0F',
        },
        gold: {
          DEFAULT: '#FFD700',
          500: '#FFD700',
        },
        noir: {
          DEFAULT: '#050508',
          300: '#1a1a2e',
          400: '#0A0A14',
          500: '#050508',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'Audiowide', 'sans-serif'],
        body: ['Space Mono', 'Roboto Mono', 'monospace'],
        glitch: ['Press Start 2P', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 10px #00FFF0, 0 0 20px #00FFF044, 0 0 40px #00FFF022',
        'neon-pink': '0 0 10px #FF00FF, 0 0 20px #FF00FF44, 0 0 40px #FF00FF22',
        'neon-purple': '0 0 10px #BD00FF, 0 0 20px #BD00FF44',
        'neon-blue': '0 0 10px #0066FF, 0 0 20px #0066FF44',
        'glitch-card': '5px 5px 0px #FF00FF44, -5px -5px 0px #00FFF044',
        'glitch-intense': '0 0 5px #FF00FF, 0 0 10px #00FFF0, 0 0 15px #BD00FF',
      },
      animation: {
        'glitch': 'glitch 0.3s ease-in-out',
        'glitch-loop': 'glitch-loop 2s infinite',
        'scanline': 'scanline 8s linear infinite',
        'data-rain': 'data-rain 20s linear infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'float-glow': 'float-glow 3s ease-in-out infinite',
        'chromatic': 'chromatic 0.2s ease-in-out',
        'circuit-flow': 'circuit-flow 10s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'shake-intense': 'shake-intense 0.5s ease-in-out',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { 
            transform: 'translate(0)',
            filter: 'hue-rotate(0deg)'
          },
          '20%': { 
            transform: 'translate(-3px, 3px)',
            filter: 'hue-rotate(90deg)'
          },
          '40%': { 
            transform: 'translate(-3px, -3px)',
            filter: 'hue-rotate(180deg)'
          },
          '60%': { 
            transform: 'translate(3px, 3px)',
            filter: 'hue-rotate(270deg)'
          },
          '80%': { 
            transform: 'translate(3px, -3px)',
            filter: 'hue-rotate(360deg)'
          },
        },
        'glitch-loop': {
          '0%, 90%, 100%': { 
            transform: 'translate(0) skewX(0)',
            opacity: '1'
          },
          '91%': { 
            transform: 'translate(-2px, 1px) skewX(-1deg)',
            opacity: '0.8'
          },
          '93%': { 
            transform: 'translate(2px, -1px) skewX(1deg)',
            opacity: '0.9'
          },
          '95%': { 
            transform: 'translate(-1px, 2px)',
            opacity: '0.85'
          },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'data-rain': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'pulse-neon': {
          '0%, 100%': { 
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor',
            opacity: '1'
          },
          '50%': { 
            boxShadow: '0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor',
            opacity: '0.8'
          },
        },
        'float-glow': {
          '0%, 100%': { 
            transform: 'translateY(0)',
            filter: 'brightness(1)'
          },
          '50%': { 
            transform: 'translateY(-10px)',
            filter: 'brightness(1.2)'
          },
        },
        chromatic: {
          '0%': { 
            textShadow: '-2px 0 #FF00FF, 2px 0 #00FFF0'
          },
          '50%': { 
            textShadow: '2px 0 #FF00FF, -2px 0 #00FFF0'
          },
          '100%': { 
            textShadow: '-2px 0 #FF00FF, 2px 0 #00FFF0'
          },
        },
        'circuit-flow': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'shake-intense': {
          '0%, 100%': { transform: 'translateX(0) rotate(0)' },
          '10%, 90%': { transform: 'translateX(-2px) rotate(-0.5deg)' },
          '20%, 80%': { transform: 'translateX(4px) rotate(1deg)' },
          '30%, 70%': { transform: 'translateX(-4px) rotate(-1deg)' },
          '40%, 60%': { transform: 'translateX(2px) rotate(0.5deg)' },
          '50%': { transform: 'translateX(-2px) rotate(-0.5deg)' },
        },
      },
      backgroundImage: {
        'circuit-pattern': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%2300FFF0' stroke-opacity='0.05' stroke-width='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        'hex-grid': `url("data:image/svg+xml,%3Csvg width='28' height='49' viewBox='0 0 28 49' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%2300FFF0' stroke-opacity='0.1' stroke-width='0.5'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5-13-7.5v-15l13-7.5z'/%3E%3Cpath d='M27.99 9.25l13 7.5v15l-13 7.5-13-7.5v-15l13-7.5z'/%3E%3Cpath d='M-0.01 9.25l13 7.5v15l-13 7.5-13-7.5v-15l13-7.5z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
