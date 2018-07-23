FROM node:10

WORKDIR /app
COPY . /app
RUN "npm" "ci"
CMD npm start