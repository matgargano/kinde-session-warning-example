When setting up Redis for session storage, I am getting a session warning right after running `setupKinde` that is indicating the redis session storage is not being used.

In a control environment (basic express service) with the same redis session setup I do not receive the error and it appears the redis session handler is working as expected

## how to reproduce the issue with the warning

this requires a kinde setup and a redis server, fill out the info in .env (use the .env.example is a starting point)

cd into `has-issue`  
run `npm install`  
run `npm run start`

observe ...

```

> vite-typescript-starter@0.0.0 start
> vite build && NODE_ENV=production tsx src/main.ts

vite v5.2.10 building for production...
✓ 1 modules transformed.
dist/index.html  0.00 kB │ gzip: 0.02 kB
✓ built in 205ms
Connected to Redis
BEFORE WE GET THE WARNING
Warning: connect.session() MemoryStore is not
designed for a production environment, as it will leak
memory, and will not scale past a single process.
AFTER WE GET THE WARNING
8:19:49 PM [vite-express] Running in production mode
8:19:50 PM [vite-express] Using Vite to resolve the config file
8:19:50 PM [vite-express] Serving static files from /Users/mgargano/Sites/poc-kinde/has-issue/dist
Server is listening on port 3000...
```

I added console logs to emphasize the issue

## how to reproduce the "control" environment without the warning

this requires just redis, fill out the info in .env (use the .env.example is a starting point)

cd into `no-issue`  
run `npm install`  
run `npm run start`

no warning is seen

```
% npm run start

> vite-typescript-starter@0.0.0 start
> vite build && NODE_ENV=production tsx src/main.ts

vite v5.2.10 building for production...
✓ 1 modules transformed.
dist/index.html  0.00 kB │ gzip: 0.02 kB
✓ built in 62ms
Connected to Redis
8:24:29 PM [vite-express] Running in production mode
8:24:29 PM [vite-express] Using Vite to resolve the config file
8:24:29 PM [vite-express] Serving static files from /Users/mgargano/Sites/poc-kinde/no-issue/dist
Server is listening on port 3000...
```
