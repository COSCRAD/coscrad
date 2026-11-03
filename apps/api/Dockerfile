# Use a Node.js base image
FROM node:24.13.0-alpine AS build

ARG NODE_ENV

ENV NODE_ENV=$NODE_ENV

# Set the working directory
WORKDIR /usr/src/app

RUN echo "Building the server for NODE_ENV: $NODE_ENV"

# Copy the source code
COPY / ./

# Install dependencies
RUN npm i -g @nestjs/cli
RUN yarn install --frozen-lock-file

# Build the server
RUN npx nx build api

# Change the default shell for all subsequent RUN instructions
SHELL ["/bin/bash", "-c"]

# This will now automatically run via /bin/bash -c "ls -la"
RUN ls 

# Production stage
FROM node:24.13.0-alpine AS production

ARG NODE_ENV

ENV NODE_ENV=$NODE_ENV

# create non-root user
RUN addgroup -g 10001 appgroup && \
    adduser -u 10001 -G appgroup -s /bin/sh -D appuser

# Copy configs
COPY --chown=appuser:appgroup ./package.json ./yarn.lock ./

WORKDIR /usr/src/app

# Copy only necessary files from the build stage
COPY --chown=appuser:appgroup --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=appuser:appgroup --from=build /usr/src/dist/apps/api ./dist

# Expose the port your NestJS application listens on
EXPOSE $NODE_PORT

USER appuser

RUN echo "starting the server with NODE_ENV=${NODE_ENV}"

# Start the application
CMD ["node", "dist/main.js"]

# CMD ["tail","-f","/dev/null"]
