FROM node:18

# Set direktori
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

ENV JWT_SECRET = 
ENV JWT_EXPIRES_IN = 1d
ENV PORT 3000

# Copy all source files
COPY . .

RUN npm install
EXPOSE 3000

CMD [ "npm", "run", "start"]
