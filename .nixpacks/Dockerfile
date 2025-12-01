FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067

ENTRYPOINT ["/bin/bash", "-l", "-c"]
WORKDIR /app/


COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d
RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends curl wget

ARG ADMIN_EMAIL CI COOLIFY_BRANCH COOLIFY_CONTAINER_NAME COOLIFY_FQDN COOLIFY_RESOURCE_UUID COOLIFY_URL INSTANT_APP_SECRET JWT_SECRET NEXT_PUBLIC_INSTANT_APP_ID NIXPACKS_METADATA NODE_ENV NPM_CONFIG_PRODUCTION SOURCE_COMMIT
ENV ADMIN_EMAIL=$ADMIN_EMAIL CI=$CI COOLIFY_BRANCH=$COOLIFY_BRANCH COOLIFY_CONTAINER_NAME=$COOLIFY_CONTAINER_NAME COOLIFY_FQDN=$COOLIFY_FQDN COOLIFY_RESOURCE_UUID=$COOLIFY_RESOURCE_UUID COOLIFY_URL=$COOLIFY_URL INSTANT_APP_SECRET=$INSTANT_APP_SECRET JWT_SECRET=$JWT_SECRET NEXT_PUBLIC_INSTANT_APP_ID=$NEXT_PUBLIC_INSTANT_APP_ID NIXPACKS_METADATA=$NIXPACKS_METADATA NODE_ENV=$NODE_ENV NPM_CONFIG_PRODUCTION=$NPM_CONFIG_PRODUCTION SOURCE_COMMIT=$SOURCE_COMMIT

# setup phase
# noop

# install phase
ENV NIXPACKS_PATH=/app/node_modules/.bin:$NIXPACKS_PATH
COPY . /app/.
RUN --mount=type=cache,id=xgc0gk0socw4cgs8k88gkg84-/root/npm,target=/root/.npm npm ci

# build phase
COPY . /app/.
RUN --mount=type=cache,id=xgc0gk0socw4cgs8k88gkg84-next/cache,target=/app/.next/cache --mount=type=cache,id=xgc0gk0socw4cgs8k88gkg84-node_modules/cache,target=/app/node_modules/.cache npm run build


RUN printf '\nPATH=/app/node_modules/.bin:$PATH' >> /root/.profile


# start
COPY . /app

CMD ["npm run start"]

