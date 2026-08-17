# Releasing WIP builds for consumers

`dist/` is build output and is gitignored — it is not committed on any branch. Published
releases (`npm publish`, tagged versions) are unaffected: `npm pack`/`npm publish` build
their file list from the `files` field in `package.json`, not from what's tracked in git.

To let a consumer (e.g. `web-app`) install a not-yet-mergeable WIP commit without
`github:mat3ra/materials-designer#branch` (which has no way to build `dist/` on install), CI publishes
a pre-release tarball asset instead.

Releases are tagged per **commit**, not per branch: `wip-<short-commit-sha>`. Each commit
gets its own immutable tag/asset URL, so a consumer pinned to a specific commit's tarball
never has the content underneath that URL silently change.

## Publishing (CI only)

Include `[release]` anywhere in a commit message and push. `.github/workflows/release-wip.yml`
runs the `js/release-wip` action (from [`mat3ra/actions`](https://github.com/mat3ra/actions))
on that push, which builds, packs, and publishes the pre-release tarball asset for that
commit. Commits without the marker don't trigger it, so routine pushes stay quiet.

There is no local/manual equivalent — building and publishing only happens in CI, so the
tarball a consumer installs is always reproducible from a pushed commit, not from
whatever happens to be on someone's machine.

The download URL follows this shape:

```text
https://github.com/mat3ra/materials-designer/releases/download/wip-<short-sha>/materials-designer.tgz
```

Re-triggering CI **on the same commit** (e.g. re-running the workflow) re-uploads over
that commit's existing asset (`gh release upload ... --clobber`) rather than minting a
duplicate. A new commit always gets a new tag/URL.

## Reinstalling in a consumer after a same-commit rebuild

Because a same-commit rebuild re-uploads over that commit's existing tag/asset, the
download URL doesn't change — which means a plain `npm install` in the consumer won't
pick up the rebuild: npm's cache stores the tarball keyed by URL, and
`package-lock.json` pins the `integrity` hash from the first install, so a
same-URL-but-changed-content refetch either gets served stale from cache or fails with
`EINTEGRITY`. Force a real refetch instead. In `web-app`, use the wrapper script from
repo root:

```bash
npm run mat3ra:install -- materials-designer wip-<short-sha>
```

(`web-app/scripts/mat3ra-install.sh` — installs `@mat3ra/materials-designer@<release-url>` with
`--legacy-peer-deps --force`.)

Delete a pre-release once its commit merges and a real published version supersedes it:

```bash
gh release delete wip-<short-sha> --yes
```

(Or let `cleanup-wip-releases.yml`, below, do it automatically once that commit is no
longer any branch's tip.)

## Automatic cleanup

`.github/workflows/cleanup-wip-releases.yml` runs weekly (Monday 06:00 UTC) via the
`js/cleanup-wip-releases` action and deletes any `wip-*` release whose commit is no
longer the tip of any branch. This is branch-aware, not age-based, and never deletes
anything not marked pre-release, regardless of tag. Trigger it manually from the Actions
tab (`workflow_dispatch`, defaults to `dry-run: true`) to test or force an off-schedule
cleanup.
