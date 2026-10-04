# bewd-ui

Nx workspace for the Bravo Echo Angular component library, [`@bravoechoweb/ui`](libs/ui).

Storybook is the component workshop. There is no demo application in this repo.

```sh
npx nx build ui
npx nx test ui
npx nx lint ui
npx nx storybook ui
npx nx build-storybook ui
```

See [libs/ui/README.md](libs/ui/README.md) for how a consuming Angular app installs the package, imports a component, and loads the Tailwind 4 theme. See [libs/ui/RELEASING.md](libs/ui/RELEASING.md) for how a version tag is published to the private npm org.
