# Step 1: Build the React app using Node.js
FROM node:18 AS build
# Install curl
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
# Set working directory
WORKDIR /app
# Copy package.json and package-lock.json to leverage Docker caching
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the source code into the container
COPY . .
# Build the production-optimized app
RUN npm run build

# Step 2: Serve the React app using NGINX
FROM nginx:alpine AS production
# Copy built React app artifacts to the NGINX default public folder
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 80 for serving the app
EXPOSE 9003
# Start the NGINX server
CMD ["nginx", "-g", "daemon off;"]