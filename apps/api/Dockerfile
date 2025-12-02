FROM "node:24-alpine" AS common

WORKDIR /src

COPY libs ./libs
COPY apps/api apps/api
COPY package.json \
  tsconfig* \
  nx.json \
  yarn.lock \
  ./

RUN echo "Using Node Version:"
RUN node -v

# install deps
RUN yarn install --frozen-lock-file

FROM common AS build
# `nx build api` fails without this directory, yet it is empty. We should remove this dependency.
RUN mkdir -p /src/apps/api/src/assets
RUN npx nx build api --skip-nx-cache

FROM common AS server
LABEL description="The COSCRAD server with REST API. It runs the NestJS application and connects to ArangoDB"
RUN mkdir -p /apps/coscrad-works
RUN chown node:node apps

USER root
RUN yarn global add pm2
WORKDIR /

COPY --from=build --chown=node:node /src/dist/apps/api /dist/apps/api
COPY --from=build --chown=node:node /src/node_modules /node_modules

# TODO this needs to be pulled from the `env`
EXPOSE 3131

# TODO Make this configurable
ENV NODE_ENV=development 
# CMD ["node", "/dist/apps/api/main.js"]

CMD ["tail","-f","/dev/null"]