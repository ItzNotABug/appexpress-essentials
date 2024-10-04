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
import cors from '@itznotabug/appexpress-cors';
import AppExpress from '@itznotabug/appexpress';

// setup
const express = new AppExpress();

express.middleware(cors({
    origin: '*', // specify an origin or * for all,
    excludes: ['/styles.css'], // exclude cors on some urls, accepts String & Regex,
    preFlightContinue: false, // if false, empty response is sent on `OPTIONS` method,
    optionsSuccessStatus: 204, // status code to be sent on `OPTIONS`,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'], // allowed methods for cors,
}));
```