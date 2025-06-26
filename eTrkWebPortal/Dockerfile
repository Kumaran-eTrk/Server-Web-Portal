# Stage 1: Build the application using Node.js
FROM node:23.8.0 as node


# Set the working directory
WORKDIR /app

# Copy the entire application directory into the container
COPY . .

# Install dependencies
# RUN npm install
RUN npm config set strict-ssl false && npm install

# Build the application
RUN npm run build

# Stage 2: Serve the built application using Nginx
FROM nginx:alpine

# Copy the built application from the previous stage to Nginx
COPY --from=node /app/dist /usr/share/nginx/html
