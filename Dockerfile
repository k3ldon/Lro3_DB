FROM node:22-alpine
WORKDIR /app/web
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ .
COPY scripts/build-db.mjs ./scripts/build-db.mjs
COPY data ./data
RUN node scripts/build-db.mjs && npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]
