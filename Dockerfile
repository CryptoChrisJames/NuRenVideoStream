FROM node:latest
RUN apt-get install ffmpeg libavcodec-extra-53
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD node index.js
EXPOSE 80