#!/usr/bin/env bash
#
# The Cypress step definitions and widgets under tests/cypress/support are a published API.
# web-app's own suite globs them out of node_modules: 62 of its feature files invoke MD's Gherkin
# phrases, and its MaterialDesignerWidget subclasses MD's. Renaming or deleting one of these files
# breaks another repository's tests, silently and at a distance.
#
# Changing a file's *contents* is always fine — that is how steps get retargeted at a new UI.
# This guard only objects to the file going away under a name someone else imports.
#
# Deliberate contract changes are allowed: put [contract-change] in a commit message on the branch,
# and coordinate the matching web-app PR.
set -euo pipefail

# ---------------------------------------------------------------- duplicate phrases
#
# Cucumber resolves a sentence to exactly one step definition, and reports "Multiple matching step
# definitions" at run time — on whichever spec happens to use it, which may not be the one that
# introduced the clash. Two files can each look fine in review. Catch it here instead.
DUPES="$(grep -rhoP '^\s*(Given|When|Then)\("\K[^"]+' tests/cypress/support/step_definitions/ \
    | sort | uniq -d || true)"

if [ -n "$DUPES" ]; then
    cat >&2 <<MSG
check-test-contract: FAILED

These Gherkin phrases are defined more than once:

$(echo "$DUPES" | sed 's/^/  /')

Cucumber matches a sentence to one definition; two makes every spec that uses the phrase fail.
Make one of them more specific — "I do not see the {string} operation panel" rather than
"I do not see the {string} panel".
MSG
    exit 1
fi

echo "check-test-contract: no duplicate Gherkin phrases."

BASE="${1:-origin/dev}"

if ! git rev-parse --verify --quiet "$BASE" >/dev/null; then
    echo "check-test-contract: base '$BASE' not available; skipping."
    exit 0
fi

MERGE_BASE="$(git merge-base "$BASE" HEAD)"

if [ "$MERGE_BASE" = "$(git rev-parse HEAD)" ]; then
    echo "check-test-contract: HEAD is an ancestor of $BASE; nothing to check."
    exit 0
fi

GONE="$(git diff --diff-filter=DR --name-only "$MERGE_BASE" HEAD -- \
    'tests/cypress/support/step_definitions/**' 'tests/cypress/support/widgets/**' || true)"

if [ -z "$GONE" ]; then
    echo "check-test-contract: no step definitions or widgets removed or renamed."
    exit 0
fi

if git log --format=%B "$MERGE_BASE..HEAD" | grep -qF '[contract-change]'; then
    echo "check-test-contract: the following are removed or renamed, declared via [contract-change]:"
    echo "$GONE" | sed 's/^/  /'
    echo
    echo "Make sure the matching web-app PR lands with it."
    exit 0
fi

cat >&2 <<MSG
check-test-contract: FAILED

These files are removed or renamed:

$(echo "$GONE" | sed 's/^/  /')

Other repositories import them by path. web-app's Cypress suite globs MD's step definitions out of
node_modules and subclasses MaterialDesignerWidget, so a rename here fails tests there.

If you are retargeting a step at a new UI, edit the file's body and keep its name. If the rename is
deliberate, add [contract-change] to a commit message on this branch and open the web-app PR to
match.
MSG
exit 1
