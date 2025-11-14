FROM node:18-alpine

WORKDIR /app

# Copy package files
# Now we specify the service path relative to ./backend
COPY services/user-service/package*.json ./

# Install dependencies
RUN npm install --production

# Copy shared models first
# Note: Build context is now ./backend (parent folder)
# Path is relative to backend/, so shared/ is accessible directly
COPY shared ./shared

# Copy source code
COPY services/user-service/src ./src

EXPOSE 4001

CMD ["npm", "start"]
