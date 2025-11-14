FROM node:18-alpine

WORKDIR /app

# Copy package files
# Build context is repository root for Railway
COPY backend/services/media-service/package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY backend/services/media-service/src ./src

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 4005

CMD ["npm", "start"]
