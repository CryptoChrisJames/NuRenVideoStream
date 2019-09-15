FROM node:latest
RUN apt install ffmpeg
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD node index.js
EXPOSE 80