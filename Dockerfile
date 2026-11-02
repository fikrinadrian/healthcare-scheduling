FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Prisma's config reads DATABASE_URL while generating the client.
ARG APP
ENV APP=${APP}
ENV DATABASE_URL="postgresql://postgres:postgres@postgres:5432/healthcare?schema=public"
RUN pnpm prisma:generate && pnpm exec nest build "$APP"

CMD ["sh", "-c", "node dist/apps/${APP}/main.js"]
