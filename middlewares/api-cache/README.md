# AppExpress API Cache Middleware

This module allows you to cache API responses for a specified period of time.

The responses are cached in memory after the first request, up until the function container is removed.\
You can check for `X-APPEXPRESS-API-CACHE` in the response header, the values will be any one of the below -

1. `HIT` - response is cached
2. `MISS` - response is not cached, probably this is the first request
3. `EXCLUDED` - the request is excluded for caching response via options or response header
4. `IGNORED` - the request method is either `PUT`, `POST` or `DELETE` which are never cached

## Installation

Add the middleware like this -

```shell
npm install @itznotabug/appexpress-apicache
```

## Usage

```javascript
// import
import AppExpress from '@itznotabug/appexpress';
import apiCache from '@itznotabug/appexpress-apicache';

// setup
const express = new AppExpress();

// set options
const cacheModule = apiCache({
    excludes: ['/admin'],
    timeout: 1000 * 60 * 5 // 5 minutes, use 0 for no expiry!
});
express.middleware(cacheModule);
```

### Excluding a particular request -

```javascript
express.get('/user/payment', async (req, res) => {
  const user = await sdk.getUser(req);
  const paymentMethods = await sdk.getPaymentMethods(user);

  res.setHeaders({ 'apicache-exclude': true });
  res.json({ paymentMethods })
});
```

### Different cache timeout for a response -

```javascript
express.get('/user/code', async (req, res) => {
  const timedContent = await sdk.timedContent(req);

  const oneMinute = 60 * 1000;
  res.setHeaders({ 'apicache-timeout': oneMinute });
  res.json({ timedContent })
});
```

### Check if cache exists for a URL

```javascript
express.get('/search/results', async (req, res) => {
  if (cacheModule.hasCache(req.url)) {
    res.empty();
    return;
  }

  const thirtySeconds = 30 * 1000;
  const { searchText } = req.params;
  const results = await sdk.search(searchText);

  res.setHeaders({ 'apicache-timeout': thirtySeconds });
  res.json({ results })
});
```

### Clear a cache for url or all cache

```javascript
cacheModule.clearCache(url);

// remove all
cacheModule.clearAllCache();
```