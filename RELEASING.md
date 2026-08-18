# Releasing WIP builds for consumers

`dist/` is build output and is gitignored — it is not committed on any branch. CI
publishes a pre-release tarball (`wip-<short-commit-sha>`) whenever a pushed commit
message contains `[release]`, via the reusable workflow at
[`mat3ra/actions`](https://github.com/mat3ra/actions#release-wip-usage-reusable-workflow).
See that README for the full explanation: why this exists, the tag/URL scheme, the
`EINTEGRITY`/npm-cache gotcha on a same-commit rebuild, and the cleanup policy.

Download URL shape:

```text
https://github.com/mat3ra/materials-designer/releases/download/wip-<short-sha>/materials-designer.tgz
```

Reinstall in `web-app` after a same-commit rebuild (plain `npm install` won't refetch —
see the linked README for why):

```bash
npm run mat3ra:install -- materials-designer wip-<short-sha>
```

Delete a pre-release once its commit merges and a real published version supersedes it:

```bash
gh release delete wip-<short-sha> --yes
```

(Or let this repo's `cleanup-wip-releases.yml` do it automatically once that commit is
no longer any branch's tip.)
