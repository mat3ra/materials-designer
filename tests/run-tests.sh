#!/bin/bash

# Read from environment variable (set in .env file)
USE_DEV_URL=$VITE_USE_JUPYTERLITE_DEV_URL

# Set default TAGS based on config
if [ "$USE_DEV_URL" = "true" ]; then
    TAGS=${TAGS:-"not @ignore"}
else
    TAGS=${TAGS:-"not @ignore and not @notebook_healthcheck"}
fi

# Set default Cypress base URL
CYPRESS_BASE_URL=${CYPRESS_BASE_URL:-"http://localhost:3001"}

# Run Cypress tests
cypress run -e TAGS="$TAGS"
