FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./

# RUN npm install --force

RUN npm install --force && npm cache clean --force

RUN npm i -g serve

COPY . .

# 👉 Tăng giới hạn heap lên 2GB
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN npm run build

EXPOSE 80

CMD [ "serve", "-s", "dist", "-p", "80" ]