import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.base.config.mjs';

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          // src/testing holds spec-only helpers and is excluded from the build.
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}', '{projectRoot}/src/testing/**'],
          // Tailwind is a peer because consumers must generate the utility
          // classes. Components do not import the package from TypeScript.
          // Flowbite is a peer because styles/theme.css imports its theme and
          // plugin, which the consumer's Tailwind build resolves.
          ignoredDependencies: ['tailwindcss', 'flowbite'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'be',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          // Attribute selectors let a component be a native element, e.g. button[be-button-cta].
          type: ['element', 'attribute'],
          prefix: 'be',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
];
