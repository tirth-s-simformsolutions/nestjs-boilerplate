FROM node:22-alpine AS builder
WORKDIR /app

ARG SERVICE
ENV SERVICE=${SERVICE}
# e.g. --build-arg SERVICE=auth-service

# Copy root configs
COPY package*.json turbo.json tsconfig*.json ./

# Copy shared packages
COPY packages ./packages

# Copy apps folder (so we can validate SERVICE)
COPY apps ./apps

# Install deps
RUN npm ci --ignore-scripts

# Build only the selected service
RUN npx turbo run build --filter=${SERVICE}

# Run the start script from that service's package.json
WORKDIR /app/apps/${SERVICE}
CMD ["npm", "run", "start"]