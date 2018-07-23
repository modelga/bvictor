# Requirements

[![Build Status](https://travis-ci.org/modelga/bvictor.svg?branch=master)](https://travis-ci.org/modelga/bvictor)
[![codecov](https://codecov.io/gh/modelga/bvictor/branch/master/graph/badge.svg)](https://codecov.io/gh/modelga/bvictor)

* Node 8.x and later
* Global `npm` & `npx`

# Install & Run

As normal Node.js application install by `npm ci` to use package-lock.json. 

Run app by `npm start`. 

View the app by default under http://localhost:3000 

By default app is using https://www.betvictor.com upstream, and in-memory cache.

## Redis-Cache

By default app uses in-memory cache. To configure redis cache please run instance e.g. by `docker run --name betvictor-redis --rm -d -p 6379:6379 redis`, and then start app by `npm run start:redis-local`.
After correct installation you should see log `  bet-victor:sports-live:redis:db Connected to Redis: localhost:6379`.

If you configure app to use redis, but provide failing, or invalid configuration, app will exit after 5 seconds. For **production**, that time should be adjust gracefully by giving enough amount of time to re-establish connection to redis.  

# Demo

https://betvictor-live.herokuapp.com

Travis: https://travis-ci.org/modelga/bvictor

Codecov: https://codecov.io/gh/modelga/bvictor