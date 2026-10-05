# @bravoechoweb/ui

Angular component library for Bravo Echo. Components are standalone, use the `be` selector prefix, and style themselves with Tailwind CSS 4 utility classes.

The published package does not include generated utility CSS. A consuming app imports the design tokens, then lets its own Tailwind build scan this package and emit the classes the components use.

Current version: `0.1.1`. The library package is not marked `private` (so it can be published). `publishConfig.access` is `restricted`, so npm will not make it public. The workspace root package is `private`, so `npm publish` from the repo root does nothing.

## Install

Peer dependencies:

| Package           | Version              |
| ----------------- | -------------------- |
| `@angular/core`   | `>=21.2.0 <23.0.0`   |
| `@angular/common` | `>=21.2.0 <23.0.0`   |
| `tailwindcss`     | `^4.0.0`             |

The package is private on npmjs.com under the `bravoechoweb` org. A consuming app needs a read-only token in the environment as `NPM_TOKEN`, and this `.npmrc` committed next to its `package.json` (the token itself stays out of git):

```
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

```sh
npm install @bravoechoweb/ui
```

How to create that token, including for a Heroku app, is in [RELEASING.md](./RELEASING.md).

The consuming app also needs the Tailwind 4 PostCSS plugin so Angular processes `@import "tailwindcss"` and `@theme`:

```sh
npm install -D @tailwindcss/postcss postcss
```

## Use a component

Import the standalone component and add it to `imports`.

```ts
import { Component } from '@angular/core';
import { ButtonCtaComponent } from '@bravoechoweb/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonCtaComponent],
  template: `<be-button-cta variant="primary" />`,
})
export class ExampleComponent {}
```

`variant` is `primary` (the default), `secondary`, `success`, `info`, `warning`, or `danger`.

## Tailwind 4 setup

In the app's global stylesheet (for example `src/styles.css`):

```css
@import 'tailwindcss';
@import '@bravoechoweb/ui/styles/theme.css';

/* Tailwind does not scan node_modules. Point it at this package so classes
   such as bg-primary and text-type-reverse are generated. */
@source "../node_modules/@bravoechoweb/ui";
```

`theme.css` holds the `@theme` tokens (brand color ramps and the Montserrat font). Import it after `tailwindcss` so Tailwind can read `@theme`.

`@source` is relative to the stylesheet. `../node_modules/@bravoechoweb/ui` is correct when the stylesheet lives in `src/` and `node_modules` is one directory up. From `apps/demo/src/styles.css` the path is `../../../node_modules/@bravoechoweb/ui`.

Add a PostCSS config at the app (or workspace) root if there is not one already. Angular's build picks up `.postcssrc.json`:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

## Work on the library in this repo

```sh
npx nx build ui
npx nx test ui
npx nx lint ui
npx nx storybook ui
npx nx build-storybook ui
```

`nx build ui` writes the npm package to `dist/libs/ui`. That folder is what the tag pipeline publishes. The public entry point is `libs/ui/src/index.ts`. See [RELEASING.md](./RELEASING.md) for the version, tag, and npm token steps.
