const { addDynamicIconSelectors } = require('@iconify/tailwind')
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontSize: {
      'tiny': ['24px', {
        letterSpacing: '0',
      }],
    }
  },
  variants: {
    extend: {},
  },
  plugins: [addDynamicIconSelectors()],
};