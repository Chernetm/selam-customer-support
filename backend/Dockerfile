# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copy dependency files first (better caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the code
COPY . .

# 👇 FIX: point to your main.go location
RUN go build -o app ./cmd/server

# Run stage
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/app .

EXPOSE 8090

CMD ["./app"]