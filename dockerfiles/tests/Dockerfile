# From https://hub.docker.com/r/cypress/browsers/tags
FROM cypress/included:13.6.0

WORKDIR /opt/test

COPY ./tests/package.json package.json
COPY ./tests/package-lock.json package-lock.json
COPY ./tests/cypress.config.ts cypress.config.ts

RUN npm install

COPY ./tests/cypress cypress

ENV NPM_RUN_COMMAND=${NPM_RUN_COMMAND:-'test:headless'}
ENV CYPRESS_BASE_URL=${CYPRESS_BASE_URL:-'http://localhost:3001'}

# Ignore the list notation for the ENTRYPOINT instruction
# hadolint ignore=DL3025
ENTRYPOINT npm run ${NPM_RUN_COMMAND}
