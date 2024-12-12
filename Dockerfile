FROM node:18

# Set direktori
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

ENV JWT_SECRET = 
ENV JWT_EXPIRES_IN = "1h"
ENV PORT 3000

# Copy all source files
COPY . .

# Install dependencies only for production
RUN npm install --only=production

EXPOSE 3000

CMD ["node", "app.js"]

