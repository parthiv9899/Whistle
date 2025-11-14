FROM node:18-alpine

WORKDIR /app

# Copy package files
# Build context is repository root for Railway
COPY backend/services/post-service/package*.json ./

# Install dependencies
RUN npm install --production

# Copy shared models first
COPY backend/shared ./shared

# Copy source code
COPY backend/services/post-service/src ./src

EXPOSE 4002

CMD ["npm", "start"]
