FROM node:18-alpine

WORKDIR /app

# Copy package files
# Build context is repository root for Railway
COPY backend/services/chat-service/package*.json ./

# Install dependencies
RUN npm install --production

# Copy shared models first
COPY backend/shared ./shared

# Copy source code
COPY backend/services/chat-service/src ./src

EXPOSE 4004

CMD ["npm", "start"]
