# AppExpress Minifier Middleware

This module allows basic minification to your outgoing responses.\
Content with `content-type` that contains `text/`, `application/json` and `application/xml` are supported.

For detailed HTML minification options, refer to
the [html-minifier-terser documentation](https://github.com/terser/html-minifier-terser?tab=readme-ov-file#options-quick-reference).

**Note: This module is not yet compatible with the current version of AppExpress (`0.2.4`)!**

## Installation

Add the middleware like this -

```shell
npm install @itznotabug/appexpress-minifier
```

## Usage

```javascript
// import
import AppExpress from '@itznotabug/appexpress';
import minifier from '@itznotabug/appexpress-minifier';

// setup
const express = new AppExpress();

// set options
minifier.options({
  excludes: [
    '/excludedPath', // direct path
    /\.txt$/, /\.css$/, // or better, use a regex
  ],
  htmlOptions: {
    removeComments: true,
    collapseWhitespace: true
  }
});

express.middleware(minifier.middleware);
```

Excluding a particular request -

```javascript
express.get('/dashboard', (_, res) => {
  res.setHeaders({ 'exclude-minify': true });
  res.render('dashboard.jsx', { props: buildProps() });
});
```

---

**Suggestion**: Middlewares in `AppExpress` are executed in the order they are added, if you use multiple middlewares,
make sure to add this one at the end so that any content processing (if done by a middleware) is preformed on the full
content. .