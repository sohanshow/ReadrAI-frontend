# Build stage
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --force

# Copy source code
COPY . .

# Create env file from build args
ARG VITE_BACKEND_URL
ARG VITE_PLAY_AI_CODE
RUN echo "VITE_BACKEND_URL=$VITE_BACKEND_URL" >> .env
RUN echo "VITE_PLAY_AI_CODE=$VITE_PLAY_AI_CODE" >> .env

# Build app
RUN npm run build

# Expose port 80 for Azure App Service
EXPOSE 80

# Start the application using Vite preview on port 80
CMD ["npm", "run", "preview", "--", "--port", "80", "--host"]