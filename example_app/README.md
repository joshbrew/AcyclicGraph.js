# Minimal [esbuild](https://esbuild.github.io/getting-started/#your-first-bundle) and [Nodejs server test env](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework).

To run: `npm run build` to bundle, then `npm start` to run the node server. It runs at `http://localhost:8000` by default.

* OR `npm test` to run both commands in sequence

You can specify https and add an ssl certificate if you follow the instructions.

>2 dependencies: `esbuild` and [`fragelement`](https://github.com/brainsatplay/domelement)

## Hot reloading (for dev)

`npm run dev`

then `npm run startdev` 

nodemon restarts the node server automatically when changes to included source files are detected.

The nodemon dev server adds basic frontend hot reloading via websocket and clientside code injection (see [nodeserver/server.js](https://github.com/moothyknight/esbuild_base/blob/master/node_server/server.js) for method).

> 2 dev dependencies: `nodemon` and `ws`

## PWA build:

To test:

`npm run pwa` 

This installs workbox-cli, generates the service worker, bundles and then starts the application. Run once if you don't need to modify the service-worker further.

> 1 additional dependency: `workbox-cli`

### Other notes:

See README.md files in each folder for more explanation on how to work with these types of applications.
