const csurf = require('csurf');

const csrfProtection = csurf({ 
  cookie: true,
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  value: (req) => {
    return req.headers['x-csrf-token'];
  }
});

module.exports = csrfProtection; 