# syntax=docker/dockerfile:1
# Production image: builds with `vpr build`, then serves .output with varlock validating the env.

FROM node:24 AS build
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# `prepare` only sets up git hooks and env typings, which a build doesn't need.
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
# The browser bundle bakes in the public origin, so it's a build arg.
ARG VITE_BASE_URL
# Placeholders only satisfy varlock's build-time validation: runtime values are never baked in.
RUN test -n "$VITE_BASE_URL" || (echo "Set the VITE_BASE_URL build arg" && exit 1); \
    APP_ENV=production DATABASE_URL=postgresql://build@localhost/build \
    BETTER_AUTH_SECRET=build pnpm run build

# Nitro bundles every server dependency into .output, so the runtime only needs the varlock CLI
# and the migrator's drizzle-orm + postgres, at the versions package.json pins (none have deps).
FROM node:24 AS runtime-deps
WORKDIR /deps
COPY package.json /tmp/app-package.json
RUN node -e ' \
      const { dependencies } = require("/tmp/app-package.json"); \
      const keep = ["varlock", "drizzle-orm", "postgres"]; \
      const pick = Object.fromEntries(keep.map((name) => [name, dependencies[name]])); \
      require("fs").writeFileSync("package.json", JSON.stringify({ type: "module", dependencies: pick })); \
    ' && npm install --omit=dev --no-audit --no-fund

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production \
    APP_ENV=production \
    PORT=3000
COPY --from=runtime-deps /deps/package.json /deps/package-lock.json ./
COPY --from=runtime-deps /deps/node_modules ./node_modules
COPY .env.schema ./
COPY drizzle ./drizzle
COPY scripts/migrate.ts ./scripts/
COPY --from=build /app/.output ./.output
# `varlock run` rewrites env.d.ts (@generateTsTypes) on every start, so /app must be writable.
RUN mkdir logs && chown node:node . logs
USER node
VOLUME /app/logs
EXPOSE 3000
# varlock checks .env.schema first and exits listing any missing or invalid variables.
CMD ["node_modules/.bin/varlock", "run", "--", "sh", "-c", "node scripts/migrate.ts && exec node .output/server/index.mjs"]
