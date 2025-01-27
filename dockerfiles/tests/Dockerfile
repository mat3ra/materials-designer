# From https://hub.docker.com/r/cypress/browsers/tags
FROM cypress/included:13.6.0

WORKDIR /opt/test

COPY ./tests/package.json package.json
COPY ./tests/package-lock.json package-lock.json
COPY ./tests/cypress.config.ts cypress.config.ts
COPY ./tests/cypress cypress

RUN npm install

ENV NPM_RUN_COMMAND="test:headless"

ENTRYPOINT npm run ${NPM_RUN_COMMAND}
