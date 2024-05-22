# AppExpress JSX View Engine

This module allows you to use React components in your Appwrite Functions
with [AppExpress](https://github.com/itznotabug/appexpress).

**Here's a [Live Demo for reference](https://appexpress.appwrite.global/?type=jsx)!**

## Installation

Add the view engine like this -

```shell
npm install @itznotabug/appexpress-jsx
```

## Usage

```javascript
// import
import jsx from '@itznotabug/appexpress-jsx';
import AppExpress from '@itznotabug/appexpress';

// setup
const express = new AppExpress();

// configure options if you want.
// jsx.options({ useStaticMarkup: true });
express.engine(['jsx', 'tsx'], jsx.engine); // js, jsx, tsx

// render jsx and pass props
express.get('/jsx', (req, res) => {
  res.render('index', { name: 'JohnDoe' });
  // or `res.render('index.jsx', { name: 'JohnDoe' });` if you have multiple view engines registered.
  // or `res.render('index.tsx', { name: 'JohnDoe' });` if you have multiple view engines registered.
});
```

---

**Note**: This view engine employs the same callback logic as `express.js`, making it compatible for use
with `express.js` applications as well.