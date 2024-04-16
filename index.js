const express = require('express');
const helmet = require('helmet')
const axios = require('axios');
const session = require('express-session')
const qs = require('qs');
const { isOktaAuthenticated } = require("./middleware/middleware")
const path = require('path');
const auth = require('./routes/auth')

const app = express();

app.use(
  session({
    proxy: true,
    secret: 'very-random-string-aweijaweiro23323fsdf',
    resave: false,
    saveUninitialized: false,
  })
);

// minimum security measures
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", "cdn.weatherapi.com"],
      'script-src': ["'self'"],
      'connect-src': ["'self'", "api.weatherapi.com"],
    }
  }
}));
app.disable('x-powered-by');

// template engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

// request body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// request query parser
app.set('query parser', function(str) {
  return qs.parse(str);
})

app.get('/', (req, res) => {
  res.render('index', {
    isOktaAuthenticated: req.session?.isOktaAuthenticated
  })
})

// protected routes with custom middleware
// if not logged in, the middleware will redirect the user to login page
app.get('/test-api', isOktaAuthenticated, (req, res) => {
  res.render('protected-page', {
    isOktaAuthenticated: req.session?.isOktaAuthenticated
  })
})

app.get('/error', (req, res) => {
    res.render('error', {
      errorMessage: 'There is an error!',
    })
})

// auth related routes
app.use('/auth', auth);

app.listen(3005, () => {
  console.log('The app is listening on port 3005!')
})