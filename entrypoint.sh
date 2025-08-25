#!/usr/bin/env bash

if [[ "$1" == "test" ]]; then
    npm run ${NPM_RUN_COMMAND:-test:headless}
else
    # If "test" is not passed as a parameter - running the application itself
    npm start -- --host
fi
