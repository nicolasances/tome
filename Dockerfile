# Use official Node.js image from Docker Hub
FROM node:18 AS build

ARG AUTH_API_ENDPOINT
ARG AWS_TOTO_API_ENDPOINT
ARG TOME_FLASHCARDS_API_ENDPOINT
ARG TOME_TOPICS_API_ENDPOINT
ARG TOME_PRACTICE_API_ENDPOINT
ARG TOME_POINTS_API_ENDPOINT
ARG TOME_CHALLENGES_API_ENDPOINT
ARG GOOGLE_CLIENT_ID
ARG OPENAI_API_KEY

ENV NEXT_PUBLIC_AUTH_API_ENDPOINT=${AUTH_API_ENDPOINT}
ENV NEXT_PUBLIC_TOTO_API_ENDPOINT_AWS=${AWS_TOTO_API_ENDPOINT}
ENV NEXT_PUBLIC_TOME_FLASHCARDS_API_ENDPOINT=${TOME_FLASHCARDS_API_ENDPOINT}
ENV NEXT_PUBLIC_TOME_TOPICS_API_ENDPOINT=${TOME_TOPICS_API_ENDPOINT}
ENV NEXT_PUBLIC_TOME_PRACTICE_API_ENDPOINT=${TOME_PRACTICE_API_ENDPOINT}
ENV NEXT_PUBLIC_TOME_POINTS_API_ENDPOINT=${TOME_POINTS_API_ENDPOINT}
ENV NEXT_PUBLIC_TOME_CHALLENGES_API_ENDPOINT=${TOME_CHALLENGES_API_ENDPOINT}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV NEXT_PUBLIC_OPENAI_API_KEY=${OPENAI_API_KEY}

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the Next.js application code
COPY . .

# Build the Next.js app
RUN npm run build

# Use a lighter image for serving the app (e.g., official Node.js Alpine image)
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app ./

# Install only production dependencies (for smaller image)
RUN npm install --production

# Expose the port that Next.js will run on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
