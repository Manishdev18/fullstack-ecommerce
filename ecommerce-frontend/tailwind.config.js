/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'piora-cream': '#F4EFE4',
        'piora-forest': '#1B3D2F',
        'piora-leaf': '#2D5A45',
        'piora-paper': '#FBF9F4',
        'piora-amber': '#E8B44D',
        'piora-border': '#D4CFC4',
        'piora-ink': '#1A1A1A',
      },
      fontFamily: {
        display: ['Merriweather', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        accent: ['Pacifico', 'cursive'],
      },
      borderRadius: {
        card: '1rem',
      },
    },
  },
  plugins: [],
};
