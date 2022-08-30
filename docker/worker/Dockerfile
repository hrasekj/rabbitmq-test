FROM node:18-alpine

ARG PNPM_VERSION=7.9.0
RUN npm --no-update-notifier --no-fund -g install pnpm@${PNPM_VERSION}

WORKDIR /app
