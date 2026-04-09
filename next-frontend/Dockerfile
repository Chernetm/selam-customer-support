# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies first
COPY package.json package-lock.json* ./

RUN npm install

# Copy rest of code
COPY . .

RUN npm run build

# Run stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]