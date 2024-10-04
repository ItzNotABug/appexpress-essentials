# AppExpress No-Cookies Middleware

This module allows you to serve resources without any cookies.\
Any `key` in the headers containing the word `cookie` will be stripped from both incoming requests and outgoing
responses.

## Installation

Add the middleware like this -

```shell
npm install @itznotabug/appexpress-nocookies
```

## Usage

```javascript
// import
import AppExpress from '@itznotabug/appexpress';
import noCookies from '@itznotabug/appexpress-nocookies';

// setup
const express = new AppExpress();

express.middleware(noCookies({ excludes: ['/cookie-allowed'] }));
```