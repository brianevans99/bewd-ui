# @bravoechoweb/ui

Angular component library for Bravo Echo. Components are standalone, use the `be` selector prefix, and style themselves with Tailwind CSS 4 utility classes.

The published package does not include generated utility CSS. A consuming app imports the design tokens, then lets its own Tailwind build scan this package and emit the classes the components use.

Current version: `0.2.0`. The library package is not marked `private` (so it can be published). `publishConfig.access` is `restricted`, so npm will not make it public. The workspace root package is `private`, so `npm publish` from the repo root does nothing.

## Install

Peer dependencies:

| Package           | Version            |
| ----------------- | ------------------ |
| `@angular/core`   | `>=21.2.0 <23.0.0` |
| `@angular/common` | `>=21.2.0 <23.0.0` |
| `tailwindcss`     | `^4.0.0`           |
| `flowbite`        | `^4.0.2`           |

The package is private on npmjs.com under the `bravoechoweb` org. A consuming app needs a read-only token in the environment as `NPM_TOKEN`, and this `.npmrc` committed next to its `package.json` (the token itself stays out of git):

```
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

```sh
npm install @bravoechoweb/ui flowbite
```

How to create that token, including for a Heroku app, is in [RELEASING.md](./RELEASING.md).

The consuming app also needs the Tailwind 4 PostCSS plugin so Angular processes `@import "tailwindcss"` and `@theme`:

```sh
npm install -D @tailwindcss/postcss postcss
```

## Use a component

Import the standalone component and add it to `imports`. The button component is an attribute on a native `<button>`, so ARIA, `id`, and form attributes work as usual.

```ts
import { Component } from '@angular/core';
import { ButtonCtaComponent } from '@bravoechoweb/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonCtaComponent],
  template: `<button be-button-cta variant="default">Save</button>`,
})
export class ExampleComponent {}
```

Inputs:

- `variant`: `default` (the default), `secondary`, `tertiary`, `success`, `danger`, `warning`, `dark`, or `ghost`.
- `size`: `xs`, `sm`, `base` (the default), `lg`, or `xl`.
- `type`: `button` (the default, so it never submits a form by accident), `submit`, or `reset`.
- `disabled`: disables the native button.
- `loading`: shows a spinner and sets `aria-busy`. The button stays focusable but ignores clicks and form submits.
- `fit`: the button fills its parent by default; `fit` shrinks it to its content. Use `fit` for icon-only buttons and for buttons in toolbars or other rows, where full-width buttons would share the row equally. For a button that's full width on phones and fits its content on wider screens, leave out `fit` and add a breakpoint class: `<button be-button-cta class="sm:w-fit">`.

An icon-only button needs a native `aria-label`, for example `<button be-button-cta aria-label="Download">`.

## Headings

`be-heading` is an attribute on a native `<h1>`–`<h6>`, so screen readers get the real heading role and level. Use it on every heading so they all look the same. Choose the tag for the page structure, never for its size.

```ts
import { HeadingComponent } from '@bravoechoweb/ui';
```

```html
<h2 be-heading>Account settings</h2>
<h2 be-heading [size]="4">Looks like an h4, announced as an h2</h2>
```

Inputs:

- `size`: `1` to `6`. Changes the look only; without it, the heading looks like its own level.

For a larger size on wider screens, add a breakpoint class such as `<h1 be-heading class="md:text-6xl">`. Headings have no margins; space them in the layout.

## Sections

`be-container` is an attribute on the `<div>` inside a page section. It sets the section's padding and maximum width, so every section is spaced the same way. Put the background and the section's name on the `<section>`: the background then runs full width, and the section is only announced as a landmark once it has a name.

```ts
import { ContainerComponent, HeadingComponent, RevealDirective } from '@bravoechoweb/ui';
```

```html
<section class="bg-neutral-primary" aria-labelledby="pricing-title">
  <div be-container beReveal="left">
    <h2 be-heading id="pricing-title">Pricing</h2>
  </div>
</section>
```

Container inputs:

- `width`: `wide` (the default, `max-w-7xl`) for grids and multi-column content, or `narrow` (`max-w-3xl`) for reading text and forms.

`beReveal` slides an element's children in once, 80ms apart, the first time it scrolls into view. Its value is the side they come from: `left` (the default) or `right`. It works on any element, not only the container. It does nothing for users who prefer reduced motion or in browsers without `IntersectionObserver`, and children show as soon as keyboard focus moves into them.

## Tailwind 4 setup

In the app's global stylesheet (for example `src/styles.css`):

```css
@import 'tailwindcss';
@import '@bravoechoweb/ui/styles/theme.css';

/* Tailwind does not scan node_modules. Point it at this package so classes
   such as bg-brand and rounded-base are generated. */
@source "../node_modules/@bravoechoweb/ui";
```

`theme.css` loads Flowbite's default theme (its `@theme` tokens such as `bg-brand`, `bg-success`, and `rounded-base`) and the Flowbite Tailwind plugin. Tailwind resolves both from the app's `node_modules`, which is why `flowbite` is a peer dependency. Import it after `tailwindcss` so Tailwind can read `@theme`. For dark mode, put the `dark` class on a parent element (for example `<html class="dark">`). The theme switches its tokens under `.dark`. The theme sets the font to Inter but doesn't load it, so load Inter in the app or text falls back to the system font.

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
