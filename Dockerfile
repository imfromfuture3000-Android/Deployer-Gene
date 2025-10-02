FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Set environment variables
ENV DEPLOYER_KEY=zhBqbd9tSQFPevg4188JxcgpccCj3t1Jxb29zsBc2R4
ENV RPC_URL=https://api.mainnet-beta.solana.com
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]