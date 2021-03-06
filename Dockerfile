FROM node:10.19.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json ./
COPY yarn.lock ./

RUN yarn --frozen-lockfile
RUN yarn global add forever

# Bundle app source
COPY . .

RUN yarn build

EXPOSE 3000
CMD [ "forever", "ts/lib/stop_limit_liquidator.js" ]
