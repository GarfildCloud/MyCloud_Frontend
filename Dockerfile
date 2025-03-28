# Сборка фронта
FROM node:18 AS builder
WORKDIR /app

# Копируем ВСЁ содержимое фронтенда
COPY . .

RUN npm install && npm run build

# Финальный образ nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
