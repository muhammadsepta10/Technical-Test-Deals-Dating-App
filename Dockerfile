# Use base image (bullseye-slim) for production as builder
FROM node:18.17.1 AS builder

# Set the working directory for builder
WORKDIR /vol/app

# Copy only *.json to leverage docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all file to workdir
COPY . .

# Build service
RUN npm run build

# Use base image (bullseye-slim) for production
FROM node:18.17.1 AS production

# Set the working directory inside the container for production
WORKDIR /vol/app

# Copy only the production dependencies and the compiled application from the builder stage
COPY --from=builder /vol/app/package*.json ./
COPY --from=builder /vol/app/dist ./dist
COPY --from=builder /vol/app/.env ./.env
COPY --from=builder /vol/app/assets ./assets

# Set NODE_ENV to development if not already set (useful for development)
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Log the current NODE_ENV to troubleshoot
RUN echo "NODE_ENV is set to: $NODE_ENV"

# Install dependencies
RUN npm ci --omit=dev

# Expose Port Service
EXPOSE 9011

# Execute command
CMD ["npm", "start"]