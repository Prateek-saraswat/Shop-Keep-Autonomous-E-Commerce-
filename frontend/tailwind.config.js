/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: {
            primary: '#0a0a0f',
            secondary: '#13141b',
            tertiary: '#1a1b26',
          },
          glass: 'rgba(20, 21, 30, 0.7)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': `
          radial-gradient(at 40% 20%, rgba(29, 78, 216, 0.3) 0px, transparent 50%),
          radial-gradient(at 80% 0%, rgba(6, 182, 212, 0.15) 0px, transparent 50%),
          radial-gradient(at 0% 50%, rgba(59, 130, 246, 0.2) 0px, transparent 50%),
          radial-gradient(at 80% 50%, rgba(6, 182, 212, 0.1) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(29, 78, 216, 0.2) 0px, transparent 50%)
        `,
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(34, 211, 238, 0.4)',
        'glow-md': '0 0 20px rgba(34, 211, 238, 0.4)',
        'glow-lg': '0 0 40px rgba(34, 211, 238, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-lg': '0 20px 50px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'neon-blue': '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
        'neon-cyan': '0 0 20px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.3)',
      },
      animation: {
        'shimmer': 'shimmer 3s linear infinite',
        'pulse-glow': 'pulse-glow 8s ease-in-out infinite',
        'pulse-glow-delayed': 'pulse-glow 8s ease-in-out infinite 4s',
        'slideDown': 'slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slideUp': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fadeIn': 'fadeIn 0.5s ease-out',
        'fadeOut': 'fadeOut 0.5s ease-out',
        'scaleIn': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'border-trace': 'border-trace 3s linear infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'gradient-y': 'gradient-y 3s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '0.15',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.25',
            transform: 'scale(1.1)',
          },
        },
        slideDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-100%)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(100%)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(34, 211, 238, 0.6), 0 0 60px rgba(34, 211, 238, 0.3)',
          },
        },
        'border-trace': {
          '0%': {
            backgroundPosition: '0% 50%',
          },
          '100%': {
            backgroundPosition: '200% 50%',
          },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.glass-panel': {
          background: 'rgba(20, 21, 30, 0.7)',
          backdropFilter: 'blur(20px) saturate(180%)',
          '-webkit-backdrop-filter': 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        },
        '.glass-card': {
          background: 'rgba(26, 27, 38, 0.6)',
          backdropFilter: 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
        },
        '.frosted-glass': {
          background: 'rgba(26, 27, 38, 0.4)',
          backdropFilter: 'blur(24px) saturate(200%)',
          '-webkit-backdrop-filter': 'blur(24px) saturate(200%)',
        },
        '.text-glow': {
          textShadow: '0 0 10px rgba(34, 211, 238, 0.4)',
        },
        '.text-glow-strong': {
          textShadow: '0 0 20px rgba(34, 211, 238, 0.6), 0 0 40px rgba(34, 211, 238, 0.3)',
        },
        '.hover-lift': {
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 20px rgba(34, 211, 238, 0.4)',
          },
        },
        '.neon-border': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            padding: '1px',
            background: 'linear-gradient(135deg, #1d4ed8, #00d4ff)',
            '-webkit-mask': 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            '-webkit-mask-composite': 'xor',
            'mask-composite': 'exclude',
          },
        },
      }
      addUtilities(newUtilities)
    },
  ],
}