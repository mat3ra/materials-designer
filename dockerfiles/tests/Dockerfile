# From https://hub.docker.com/r/cypress/browsers/tags
FROM cypress/included:13.6.0

WORKDIR /opt/test

COPY ./tests/package.json package.json
COPY ./tests/package-lock.json package-lock.json
COPY ./tests/cypress.config.ts cypress.config.ts
COPY ./tests/run-tests.sh run-tests.sh

RUN npm install && chmod +x run-tests.sh

COPY ./tests/cypress cypress

ARG NPM_RUN_COMMAND=test:headless
ARG CYPRESS_BASE_URL=http://localhost:3001
ENV NPM_RUN_COMMAND=${NPM_RUN_COMMAND}
ENV CYPRESS_BASE_URL=${CYPRESS_BASE_URL}

ENTRYPOINT ["sh", "-c", "npm run ${NPM_RUN_COMMAND}"]
