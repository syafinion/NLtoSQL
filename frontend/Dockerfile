# Dockerfile for React frontend with TypeScript
FROM node:18-alpine as build

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies with specific flags for better reliability
RUN npm ci --legacy-peer-deps

# Install react-scripts explicitly
RUN npm install react-scripts

# Install additional TypeScript type declarations
RUN npm install --save-dev @types/prismjs

# Copy all project files
COPY . .

# Make sure we're using TypeScript files by removing any old .js files with .tsx counterparts
RUN find src -name "*.js" ! -name "*.test.js" ! -name "setupTests.js" ! -name "reportWebVitals.js" -delete

# List node_modules to debug
RUN ls -la node_modules/.bin/

# Build the app using node to execute the react-scripts directly
RUN NODE_ENV=production node ./node_modules/react-scripts/scripts/build.js

# Production image
FROM node:18-alpine as prod

WORKDIR /app

RUN npm install -g serve

# Copy built assets from build stage
COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"] 