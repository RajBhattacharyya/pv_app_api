FROM node:23-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Install dependencies (no cache for reduced size)
RUN apk add --no-cache \
    && rm -rf /var/cache/apk/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production && npm install pm2 -g

# Copy the rest of the application code
COPY . .

# Exclude .env file from the image
RUN rm -f .env

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application using pm2
CMD [ "pm2-runtime", "start", "app.js" ]
