# Releasing the dibber command

Publishing a GitHub Release publishes `@immediately-run/dibber` to npm. The `publish` job in
[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs the tests, checks that the
release tag matches the version, and runs `npm publish`. It uses npm
[trusted publishing](https://docs.npmjs.com/trusted-publishers): GitHub proves to npm which
repository and workflow are asking, so no npm token is stored in this repository or its
secrets. npm adds a provenance statement linking each version to the commit and workflow run
that built it.

## One-time setup (the owner)

The package has to exist on npm before a trusted publisher can be added to it. 0.1.0 was
published by hand, so that's done.

1. **On npmjs.com:** open `@immediately-run/dibber` → *Settings* → *Trusted publishing*, choose
   *GitHub Actions*, and enter:
   - Organization or user: `immediately-run`
   - Repository: `Dibber`
   - Workflow filename: `ci.yml`
   - Environment name: `npm`

   Or from a terminal logged in to npm, with npm 11.5.1 or later:
   `npm trust github @immediately-run/dibber --repo immediately-run/Dibber --file ci.yml --env npm`.
   Check `npm trust --help` first; the flags may differ in your npm version.
2. **On GitHub:** *Settings* → *Environments* → *New environment* `npm`. Optionally, add yourself
   as a required reviewer, so every publish waits for your click, and limit it to tags
   matching `v*`.
3. **Make sure the package is public.** A scoped package published with plain `npm publish` is
   private. `npm access get status @immediately-run/dibber` shows which it is, and
   `npm access set status=public @immediately-run/dibber` changes it. `package.json` now sets
   `publishConfig.access` to `public`, so later versions publish publicly.
4. **Once a release from the workflow has worked:** on the package's npm settings, turn on
   *Require two-factor authentication and disallow tokens*, so only the workflow can publish.

## Each release

```
npm version 0.2.0        # sets package.json and .claude-plugin/ to 0.2.0, commits, tags v0.2.0
git push --follow-tags   # on a branch, through a PR; tag the merge commit on main if you prefer
```

Then, on GitHub, *Releases* → *Draft a new release*: pick the tag `v0.2.0`, write the notes, and
*Publish release*. The workflow publishes 0.2.0. A release marked *pre-release* publishes under
the `next` dist-tag instead of `latest`.

If the tag doesn't match the version, the job fails before publishing and says which is which.
`node scripts/check-release.mjs` runs the same check locally.
