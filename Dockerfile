# Base image
FROM node:22

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package.json yarn.lock ./

# Install app dependencies
RUN yarn install

# Bundle app source
COPY . .

# Copy the .env and .env.development files
# COPY .production .env.development ./

# Creates a "dist" folder with the production build
RUN yarn run build

# Expose the port on which the app will run
EXPOSE 3000

# Start the server using the production build
CMD ["yarn", "run", "start:prod"]