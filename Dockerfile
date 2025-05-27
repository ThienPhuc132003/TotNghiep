# FROM node:20-slim

# WORKDIR /app

# COPY package.json package-lock.json* ./

# RUN npm install --force && npm cache clean --force

# RUN npm i -g serve

# COPY . .

# ENV NODE_OPTIONS="--max-old-space-size=2048"

# RUN npm run build

# EXPOSE 80

# CMD [ "serve", "-s", "dist", "-p", "80" ]


# Sử dụng image nhẹ và phổ biến
FROM node:20-slim

WORKDIR /app

# Cài đặt serve
RUN npm install -g serve

# Copy chỉ thư mục dist vào container
COPY dist ./dist

# Chạy với giới hạn bộ nhớ nếu cần
ENV NODE_OPTIONS="--max-old-space-size=2048"

EXPOSE 80

CMD ["serve", "-s", "dist", "-l", "80"]