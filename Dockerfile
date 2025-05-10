# Use Node.js LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies to make the image smaller
RUN npm prune --omit=dev

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]