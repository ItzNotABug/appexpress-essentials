# AppExpress Favicon Middleware

This module allows you to use a `favicon.ico` in your Appwrite Functions with `AppExpress`.

The `favicon.ico` is saved in memory after the first request until the function container is removed.

**Here's a [Live Demo for reference](https://appexpress.appwrite.global)!**

## Installation

Add the middleware like this -

```shell
npm install @itznotabug/appexpress-favicon
```

## Usage

```javascript
// import
import AppExpress from '@itznotabug/appexpress';
import favIcon from '@itznotabug/appexpress-favicon';

// setup
const express = new AppExpress();

// if you serve static content & 
// the favicon is in public dir then exclude favicon explicitly.
express.static('public', ['favicon.ico']);

// set options
favIcon.options({ iconPath: 'icons/favicon.ico', maxCacheDays: 30 });
express.middleware(favIcon.middleware);
```