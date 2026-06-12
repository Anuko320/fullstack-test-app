FROM node:20-bookworm AS build

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build


FROM node:20-bookworm

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY --from=build /app/dist ./dist

RUN printf '#!/bin/sh\nnode dist/database/seed.js\nnode dist/main\n' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]