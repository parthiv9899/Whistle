FROM node:18-alpine

WORKDIR /app

# Copy package files
# Note: Build context is now ./backend (parent folder)
# So we need to specify the service path
COPY services/api-gateway/package*.json ./

# Install dependencies
RUN npm install --production

# Copy shared models
COPY shared ./shared

# Copy source code
COPY services/api-gateway/src ./src

EXPOSE 4000

CMD ["npm", "start"]
