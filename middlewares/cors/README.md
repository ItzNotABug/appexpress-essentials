# AppExpress `CORS` Middleware

This module allows you to specify `cors` policy for your Appwrite Functions with `AppExpress`.

## Installation

Add the middleware like this -

```shell
npm install @itznotabug/appexpress-cors
```

## Usage

```javascript
// import
import AppExpress from '@itznotabug/appexpress';
import corsMiddleware from '@itznotabug/appexpress-cors';

// setup
const express = new AppExpress();

// set options
corsMiddleware.options({ origin: '*', // specify an origin or * for all,
  excludes: ['/styles.css'], // exclude cors on some urls, accepts String & Regex,
  preFlightContinue: false, // if false, empty response is sent on `OPTIONS` method,
  optionsSuccessStatus: 204, // status code to be sent on `OPTIONS`,
  methods: ['get', 'head', 'put', 'patch', 'post', 'delete'], // allowed methods for cors.
    
});

// set the middleware
express.middleware(corsMiddleware.middleware);
```