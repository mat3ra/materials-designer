#!/bin/bash

# Set default TAGS if not provided
TAGS=${TAGS:-"not @ignore"}

# If not using dev JupyterLite, exclude notebook healthcheck tests
if [ "$USE_JUPYTERLITE_DEV_URL" != "true" ]; then
    TAGS="$TAGS and not @notebook_healthcheck"
fi

# Set default Cypress base URL
CYPRESS_BASE_URL=${CYPRESS_BASE_URL:-"http://localhost:3001"}

# Run Cypress tests
cypress run -e TAGS="$TAGS"
