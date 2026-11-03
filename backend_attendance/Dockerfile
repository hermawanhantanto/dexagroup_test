FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

COPY src ./src/

RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run seed && node dist/main.js"]
