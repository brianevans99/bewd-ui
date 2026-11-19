import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.@(mdx|stories.@(js|ts))',
    '../*/src/**/*.@(mdx|stories.@(js|ts))',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    {
      name: '@storybook/addon-styling-webpack',
      options: {
        // This addon replaces Storybook's CSS rules, so Angular component `styles` need a rule here too.
        rules: [
          {
            // Angular compiles component `styles` as `*.ts.css?ngResource` and expects a CSS string back.
            test: /\.css$/,
            resourceQuery: /ngResource/,
            use: [{ loader: 'css-loader', options: { exportType: 'string' } }],
          },
          {
            // Global stylesheets. style-loader injects them into the page and exports undefined,
            // which is why component styles are kept out of this rule.
            test: /\.css$/,
            resourceQuery: { not: [/ngResource/] },
            sideEffects: true,
            use: [
              'style-loader',
              'css-loader',
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    // String reference is ESM safe!
                    plugins: ['@tailwindcss/postcss'],
                  },
                },
              },
            ],
          },
        ],
      },
    },
  ],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
};

export default config;
