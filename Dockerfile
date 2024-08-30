# Use base image (bullseye-slim) for production as builder
FROM node:18.17.1 AS builder

# Set the working directory for builder
WORKDIR /vol/app

# Copy only *.json to leverage docker caching
COPY package*.json ./

RUN npm i -g husky

# Install dependencies
RUN npm install

# Install necessary dependencies for running Chromium.
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*


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
# COPY --from=builder /vol/app/assets ./assets

# Set NODE_ENV to development if not already set (useful for development)
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Log the current NODE_ENV to troubleshoot
RUN echo "NODE_ENV is set to: $NODE_ENV"

RUN npm i -g husky

# Install dependencies
RUN npm ci --omit=dev

# Expose Port Service
EXPOSE 9011

# Execute command
CMD ["npm", "start"]