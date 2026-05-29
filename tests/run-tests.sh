#!/bin/bash

if [ "$VITE_USE_JUPYTERLITE_DEV_URL" = "true" ]; then
    TAGS=${TAGS:-"not @ignore and @notebook_healthcheck"}
else
    TAGS=${TAGS:-"not @ignore and not @notebook_healthcheck"}
fi

# Set default Cypress base URL
export CYPRESS_BASE_URL=${CYPRESS_BASE_URL:-"http://localhost:3001"}

# Run Cypress tests
cypress run -e TAGS="$TAGS"
