#!/bin/sh
# Emit the Mat3rial D3sign token block from the single source of truth
# (src/v2/styles/tokens.ts). $1 is an optional selector scope ("html" for the
# mockups). Called by build.py; also usable on its own to refresh md2.css.
set -e
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO=$(CDPATH= cd -- "$HERE/../../.." && pwd)
OUT=$(mktemp -d)
trap 'rm -rf "$OUT"' EXIT
cd "$REPO"
npx esbuild src/v2/styles/tokens.ts --format=esm --outfile="$OUT/tokens.mjs" >/dev/null 2>&1
node -e "import('$OUT/tokens.mjs').then(m => process.stdout.write(m.toCssBlock(process.argv[1]||'')))" "$1"
