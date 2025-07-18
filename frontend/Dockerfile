# Dockerfile for React frontend with TypeScript
FROM node:18-alpine as build

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies with specific flags for better reliability
RUN npm ci --legacy-peer-deps

# Install additional TypeScript type declarations
RUN npm install --save-dev @types/prismjs

# Copy all project files
COPY . .

# Make sure we're using TypeScript files by removing any old .js files with .tsx counterparts
RUN find src -name "*.js" ! -name "*.test.js" ! -name "setupTests.js" ! -name "reportWebVitals.js" -delete

# Build the app using npx to ensure the locally installed react-scripts is used
RUN npx react-scripts build

# Production image
FROM node:18-alpine as prod

WORKDIR /app

RUN npm install -g serve

# Copy built assets from build stage
COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"] 