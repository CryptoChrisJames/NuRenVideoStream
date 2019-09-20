FROM node:latest
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD node index.js
EXPOSE 80