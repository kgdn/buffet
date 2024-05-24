# Use the official Node.js image as the base image
FROM node:latest as build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the rest of the project files to the container
COPY . .

# Build the Vite project
RUN npm run build

# Use the official Nginx image as the base image for serving the built files
FROM nginx:latest

# Copy the Nginx configuration file to the container
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from the previous stage to the Nginx container
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 443 to the outside world
EXPOSE 443

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]