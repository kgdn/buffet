# Use the official Node.js image as the base image
FROM node:latest AS build_client

# Set the working directory inside the container
WORKDIR /app

# Copy the .git directory to the container to allow for the use of the git hash in the Vite project
COPY .git /app/.git

# Copy the package.json and package-lock.json files to the container
COPY client/ /app

ARG VITE_API_URL
ARG VITE_MAX_VM_COUNT

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MAX_VM_COUNT=$VITE_MAX_VM_COUNT

# Install the project dependencies
RUN npm install

# Build the Vite project
RUN npm run build

# Use the official Nginx image as the base image for serving the built files
FROM nginx:latest AS serve_client

# Copy the built files from the previous stage to the Nginx container
COPY --from=build_client /app/dist /usr/share/nginx/html

# Copy the Nginx configuration file to the container
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port Nginx will listen on
ARG PORT

EXPOSE $PORT

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]

FROM python:3.12 AS build_server

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container at /server
COPY server/ /app

# Install qemu-system-x86_64
RUN apt-get update && apt-get install -y qemu-system

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Run gunicorn
CMD ["gunicorn", "app:app"]