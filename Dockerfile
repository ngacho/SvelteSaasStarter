# Use the official Node.js 18 image.
# This is a lightweight version of the Node image that contains only the bare essentials.
FROM node:18-alpine3.17 as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json) to the container
COPY package.json package-lock.json* ./

# Install dependencies
# This uses npm ci which is better for reproducible builds
RUN npm install

# Copy the rest of your application's code
COPY . .

# Build the application for production
RUN npm run build

# Expose the port the app runs on
EXPOSE 4173

# Command to run your app
CMD ["npm", "run", "preview"]
