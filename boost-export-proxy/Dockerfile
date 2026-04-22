# Node 20 alpine — small image, native fetch, native test runner
FROM node:20-alpine

WORKDIR /app

# Zero npm deps — copy package.json for metadata only.
COPY package.json ./
COPY src ./src

# Non-root user (alpine node image ships one)
USER node

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "src/index.js"]
