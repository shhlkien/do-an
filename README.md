## Basic setup for webpack ^4.x with Node.js and Express

##### Note:
- For optimal code needed, I only config `webpackDevMiddleware` to report if there is an error. Change to `normal` to see what webpack does.
```js
 app.use(webpackDevMiddleware(compiler, {
    stats: 'errors-only',
  }));
```
- If you are using `optimization.splitChunks.chunks: all`, remember to extract assets from chunks to get the right import.
```js
// index.js
import 'index.css';
// goodbye.js
import 'index.css';

// no chunks:
// index router
const assets = extractAssets(res, 'index');
// goodbye router
const assets = extractAssets(res, 'goodbye');

// shared chunks
// index router
const assets = extractAssets(res, 'index', 'goodbye~index'); // '~' is default delimiter between chunks
// goodbye router
const assets = extractAssets(res, 'goodbye', 'goodbye~index');
```
