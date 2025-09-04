/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 0.5s ease-in",
        "slide-up": "slideUp 0.3s ease-out"
      },
      keyframes: {
        fadeIn: {
          from: { 
            opacity: "0", 
            transform: "translateY(20px)" 
          },
          to: { 
            opacity: "1", 
            transform: "translateY(0)" 
          }
        },
        slideUp: {
          from: { 
            transform: "translateY(100%)" 
          },
          to: { 
            transform: "translateY(0)" 
          }
        }
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
}
