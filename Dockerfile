# First stage: Install dependencies
FROM oven/bun:1.0 AS deps

COPY package.json ./
COPY bun.lockb ./
COPY src ./src

RUN bun install

COPY . .

RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]