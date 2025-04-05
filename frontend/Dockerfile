# Stage 1: Build the React application
FROM node:18 AS build-stage

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . ./
RUN npm run build

# Stage 2: Serve the built assets with Nginx
FROM nginx:stable-alpine

# Copy built assets from the build stage
COPY --from=build-stage /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
