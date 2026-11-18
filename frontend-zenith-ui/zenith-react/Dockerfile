# Build the Vite application
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies separately to take advantage of Docker layer caching
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Serve the production build with Nginx
FROM nginx:alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
