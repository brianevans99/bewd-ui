# Releasing @bravoechoweb/ui

The package is a private package on npmjs.com in the paid org `bravoechoweb`. Version 0.1.1 was never published. `@bravoecho/ui` is the wrong scope: npm returns E402 for it.

This repository does not publish. A git tag matching `v*` triggers Bitbucket Pipelines, which builds `dist/libs/ui` and runs `npm publish --access restricted`.

## 1. Cut a version locally

From a clean `main`, with the changes you want to release already merged:

```sh
npx nx release 0.1.2 --projects=ui --skip-publish
```

Use the next version instead of `0.1.2`. Nx will:

1. Build the library (`preVersionCommand`).
2. Write the new version into `libs/ui/package.json` (and the built manifest).
3. Prepend `CHANGELOG.md` from commits since the previous `v*` tag.
4. Commit, and tag that commit `v0.1.2` (the pattern is `v{version}`).

`--skip-publish` answers no to the publish prompt. Do not publish from your laptop. The commit message still says `chore(release): publish 0.1.2` because that is Nx's default text.

Push the commit and the tag. Pushing the tag is what starts the publish pipeline:

```sh
git push origin main
git push origin v0.1.2
```

## 2. What Pipelines does with the tag

`bitbucket-pipelines.yml` on tags matching `v*`:

1. `npm ci`
2. `npx nx build ui`
3. Checks that the tag `vX.Y.Z` matches `version` in `dist/libs/ui/package.json`
4. `npm publish dist/libs/ui --access restricted`

The root `.npmrc` is only:

```
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

npm reads `NPM_TOKEN` from the environment. Nothing in the repo is a token. `publishConfig.access` is `restricted`, and the publish command repeats `--access restricted`, so a public publish has to be done on purpose twice.

Pull requests and pushes to `main` run `npm ci`, then `nx run-many -t lint,test,build -p ui`. They do not publish.

The workspace root `package.json` is `"private": true`. `npm publish` from the repo root is a no-op. Publish only the built folder `dist/libs/ui`.

## 3. Create NPM_TOKEN on npm

1. Sign in to npmjs.com as a member of the `bravoechoweb` org who can publish.
2. Open Access Tokens and generate a **granular** access token.
3. Packages and scopes: the `@bravoechoweb` scope, including `@bravoechoweb/ui`.
4. Permissions: read and write for publish. A token used only by apps to install should be read-only. Use a separate token for that.
5. Turn on **bypass two-factor authentication**. Pipelines cannot enter a one-time code, and a token without bypass fails in CI.
6. Copy the token once. npm will not show it again.

## 4. Add the token in Bitbucket

1. Open this repository, then Repository settings, then Pipelines, then Repository variables.
2. Name: `NPM_TOKEN`.
3. Value: the granular publish token.
4. Check **Secured** so the log masks it.
5. Save. Do not enable or change anything else, and do not put the token in a file.

Pipelines is not turned on by the files in this pull request. Someone still has to enable Pipelines for the repository in Bitbucket before a tag will publish.

## 5. Install from a consuming app, including Heroku

Commit this `.npmrc` next to the app's `package.json`. Commit the file, not the token:

```
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

Create a second granular token that is **read-only** on `@bravoechoweb/ui`, also with bypass 2FA if the host cannot prompt. Set it as `NPM_TOKEN` in the environment that runs `npm install`.

On Heroku that is a config var:

```sh
heroku config:set NPM_TOKEN=npm_... --app <app>
```

Then:

```sh
npm install @bravoechoweb/ui
```

The app also installs the `flowbite` peer dependency (`npm install flowbite`), because `theme.css` imports Flowbite's minimal theme and plugin. `@import '@bravoechoweb/ui/styles/theme.css'` and `@source "../node_modules/@bravoechoweb/ui"` are the Tailwind 4 setup. The component import is `@bravoechoweb/ui`.
