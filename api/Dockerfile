FROM node:21-alpine

RUN apk add --no-cache tzdata
ENV TZ=Asia/Ho_Chi_Minh
WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn
COPY . .

RUN yarn build

CMD ["yarn", "start"]
