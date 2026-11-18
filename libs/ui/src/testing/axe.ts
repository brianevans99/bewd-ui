import { configureAxe } from 'jest-axe';

// Consumers apply their own colour themes, and jsdom can't compute contrast anyway; they check it downstream.
export const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
});
