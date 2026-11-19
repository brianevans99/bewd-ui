# Releasing @bravoechoweb/ui

Pushing a `vX.Y.Z` tag publishes to npm through Bitbucket Pipelines. Never publish from your laptop.

**Order matters:** the version bump must be merged into `main` _before_ you tag. The pipeline stops if the tag doesn't match `version` in `libs/ui/package.json` on the tagged commit.

## Release

Pick the version. Before 1.0: a new feature or breaking change bumps the minor (`0.4.0` → `0.5.0`), a fix bumps the patch (`0.4.0` → `0.4.1`).

**1. Bump the version on a branch.** Start from `main` with the changes already merged:

```sh
git switch main && git pull
git switch -c release/X.Y.Z
npx nx release X.Y.Z --projects=ui --skip-publish
git push -u origin release/X.Y.Z
```

`nx release` sets the version in `libs/ui/package.json`, adds a `CHANGELOG.md` entry from your `feat:` / `fix:` commits, and commits. It doesn't tag or publish.

**2. Open a PR for `release/X.Y.Z` and merge it** once its pipeline passes.

**3. Tag the merged `main`:**

```sh
git switch main && git pull
grep '"version"' libs/ui/package.json   # must say X.Y.Z
git tag vX.Y.Z && git push origin vX.Y.Z
```

**4. Check it published:** watch the tag's pipeline in Bitbucket, then run `npm view @bravoechoweb/ui version`.

## If the tag went on the wrong commit

The pipeline fails with `Tag "vX.Y.Z" does not match package version …` and nothing is published. Delete the tag locally and on Bitbucket, finish steps 1–2, then tag again:

```sh
git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z
```

## What the pipelines run

- **Pull requests:** `npm ci`, then lint, test and build. Nothing is published.
- **`v*` tags:** the same checks, then the tag-vs-version check, then `npm publish dist/libs/ui --access public`.
- **`main`:** nothing. It only changes through PRs that already passed.

## One-time setup

You only need this again if the token expires or the repository moves.

- **Publish token:** on npmjs.com, as a `bravoechoweb` org member, create a granular access token with read and write access to `@bravoechoweb/ui`, and turn on **bypass two-factor authentication** (Pipelines can't enter a code).
- **Bitbucket variable:** Repository settings → Pipelines → Repository variables: add `NPM_TOKEN` with the token as its value, marked **Secured**. The root `.npmrc` reads it; never put the token in a file.
- **Pipelines enabled:** Repository settings → Pipelines → Settings. A tag pushed while Pipelines is off publishes nothing.
- **Protect `main`:** Repository settings → Branch restrictions: no direct write access, merge via pull request only, prevent deleting and rewriting history, and require 1 successful build.

Consumers don't need a token: the package is public, so `npm install @bravoechoweb/ui` works anywhere, including Heroku. App setup (Tailwind, imports) is in [README.md](./README.md).
