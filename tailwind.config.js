/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // ===== 原有动画保留 + 柔光动画扩展 =====
      textShadow: {
        'glow': '0 0 80px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3)',
      },
      keyframes: {
        'text-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))' },
          '50%': { filter: 'drop-shadow(0 0 18px rgba(255, 255, 255, 0.7))' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'spin-slower': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(147, 197, 253, 0.3)' },
          '50%': { boxShadow: '0 0 35px rgba(147, 197, 253, 0.6)' },
        },
        'fade-float': {
          '0%, 100%': { opacity: 0.9, transform: 'translateY(0px)' },
          '50%': { opacity: 1, transform: 'translateY(-6px)' },
        },
        meteor: {
          '0%': { opacity: '1', transform: 'scale(1) translate(0, 0 )' },
          '100%': { opacity: '0', transform: 'scale(0.2) translate(20px, 40px )' },
        },
      },
      animation: {
        'text-glow': 'text-glow 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 6s linear infinite',
        'spin-slower': 'spin-slower 9s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'fade-float': 'fade-float 4s ease-in-out infinite',
        meteor: 'meteor 0.6s ease-out forwards',
      },

      // ===== 全新颜色系统（柔光夜色系）=====
      colors: {
        night: '#0b0f19',       // 深靛夜空
        orbit: '#3c4a66',       // 灰蓝轨道层
        aurora: '#6c8bbd',      // 极光蓝
        starlight: '#e3e8f1',   // 星光银白
        roseveil: '#d7b8c4',    // 柔粉雾光
        nebula: '#151c2e',      // 星云底层
        mist: '#a6b3c6',        // 柔雾蓝灰
      },

      // ===== 新渐变体系（夜空到极光）=====
      backgroundImage: {
        'night-sky': 'linear-gradient(160deg, #0b0f19 0%, #151c2e 40%, #3c4a66 100%)',
        'aurora-glow': 'linear-gradient(120deg, rgba(108,139,189,0.4) 0%, rgba(215,184,196,0.4) 100%)',
        'stardust': 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0) 70%)',
      },

      // ===== backdrop blur =====
      backdropBlur: {
        xs: '2px',
      },

      // ===== 细节优化 =====
      boxShadow: {
        'soft-aurora': '0 0 30px rgba(108, 139, 189, 0.3)',
        'rose-glow': '0 0 30px rgba(215, 184, 196, 0.3)',
      },
    },
  },
  plugins: [],
};
