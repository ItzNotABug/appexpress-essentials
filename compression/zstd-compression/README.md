# AppExpress ZSTD Compression

This module allows you to perform `zstd` web compression for compressible resources.

**Note: This module is not yet compatible with the current version of AppExpress (`0.2.4`)!**

## Installation

Add the middleware like this -

```shell
npm install @itznotabug/appexpress-zstd
```

## Usage

```javascript
// import
import zstd from '@itznotabug/appexpress-zstd';
import AppExpress from '@itznotabug/appexpress';

// setup
const express = new AppExpress();

// set an optional compression level.
express.compression(zstd({ level: 12 }));
```

**Note**: If there was an error while compressing the content, the uncompressed content is returned as is.