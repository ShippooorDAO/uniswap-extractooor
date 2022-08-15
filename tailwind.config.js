const daisyui = require('daisyui');

module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  purge: {
    enabled: true,
    content: ['./src/**/*.tsx'],
    options: {
      safelist: ['dark'], //specific classes
    },
  },
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [daisyui, require('@tailwindcss/typography')],
  daisyui: {
    themes: ['dark', 'light'],
  },
};