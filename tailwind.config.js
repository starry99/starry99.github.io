/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'ms-sans-serif': ['MS Sans Serif', 'Tahoma', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        'win-bg': 'var(--win-bg)',
        'win-border-dark': 'var(--win-border-dark)',
        'win-border-light': 'var(--win-border-light)',
        'win-shadow-dark': 'var(--win-shadow-dark)',
        'win-shadow-light': 'var(--win-shadow-light)',
        'win-nav': 'var(--win-nav)',
        'win-nav-active': 'var(--win-nav-active)',
        'win-hover': 'var(--win-hover)',
        'win-disabled': 'var(--win-disabled)',
        'win-selected': 'var(--win-selected)',
      },
      boxShadow: {
        'win-out': 'inset -1.5px -1.5px 0 0 var(--win-border-dark), inset 1.5px 1.5px 0 0 var(--win-border-light), inset -3px -3px 0 0 var(--win-shadow-dark), inset 3px 3px 0 0 var(--win-bg)',
        'win-in': 'inset -1.5px -1.5px 0 0 var(--win-border-light), inset 1.5px 1.5px 0 0 var(--win-border-dark), inset -3px -3px 0 0 var(--win-bg), inset 3px 3px 0 0 var(--win-shadow-dark)',
        'win-window': 'inset -1.5px -1.5px 0 0 var(--win-border-dark), inset 1.5px 1.5px 0 0 var(--win-shadow-light), inset -3px -3px 0 0 var(--win-shadow-dark), inset 3px 3px 0 0 var(--win-border-light)',
      },
    },
  },
  plugins: [],
}

