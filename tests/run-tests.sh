#!/bin/bash

# @parity_2_0 marks specs harvested from PR #299 that describe MD 2.0 behaviour not yet built.
# They are the cutover's parity specification: red until their feature lands, so they stay out of
# the default run. Execute them deliberately with TAGS='@parity_2_0'.
if [ "$VITE_USE_JUPYTERLITE_DEV_URL" = "true" ]; then
    TAGS=${TAGS:-"not @ignore and not @quarantine and @notebook_healthcheck"}
else
    TAGS=${TAGS:-"not @ignore and not @quarantine and not @notebook_healthcheck and not @parity_2_0"}
fi

# Set default Cypress base URL
export CYPRESS_BASE_URL=${CYPRESS_BASE_URL:-"http://localhost:3001"}

# Run Cypress tests
cypress run -e TAGS="$TAGS"
