ARG BASE_IMAGE=node
# Not using "alpine" to allow node gyp to work with package installations from "https://github.com" directly
ARG IMAGE_TAG=20
FROM ${BASE_IMAGE}:${IMAGE_TAG}

WORKDIR /opt/app

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
# https://stackoverflow.com/questions/35774714/how-to-cache-the-run-npm-install-instruction-when-docker-build-a-dockerfile
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm cache clean --force && npm install --legacy-peer-deps --verbose

COPY . .

EXPOSE 3001

ENTRYPOINT ["/opt/app/entrypoint.sh"]
