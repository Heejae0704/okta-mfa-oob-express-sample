const express = require('express');
const router = express.Router();
const axios = require('axios');
const { oktaDomain, clientId } = require('../oktaConfig')

// login page
router.get('/login', (req, res) => {
  res.render('auth/login')
})

// email and password sent from the frontend to this endpoint
router.post('/login', async (req, res) => {
  const options = {
    // not to raise error for 403 or 401 status
    validateStatus: function (status) {
      return status < 500; // Resolve only if the status code is less than 500
    },
    method: 'post',
    url: oktaDomain + '/oauth2/v1/token',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: `client_id=${clientId}&scope=openid%20profile&grant_type=password&username=${encodeURIComponent(req.body.email)}&password=${encodeURIComponent(req.body.password)}`
  };
  
  try {
    // call Okta OIDC API to check password
    const response = await axios.request(options);
    console.log(response.status);
    console.log(response.data);
      // mfa token will be issued only when password is correct
      // Okta responds with 403 forbidden
      if (response.data.mfa_token) {
        req.session.isPasswordVerified = true;
        req.session.mfaToken = response.data.mfa_token
        req.session.save(() => {
          res.render('auth/login-primary-result', {
            isPasswordVerified: req.session.isPasswordVerified
          })
        })
      } else {
        // when the password is wrong, or the user is not there
        res.render('error', {
          errorMessage: 'Your email and/or password is not correct!',
        })
      }

  } catch (error) {
    console.error(error);
    res.render('error')
  }
})

// when the user clicks 'Send Push to Okta Verify' from login-primary-result view.
router.get('/factor-challenge', async (req, res) => {
  const options = {
    // not to raise error for 403 or 401 status
    validateStatus: function (status) {
      return status < 500; // Resolve only if the status code is less than 500
    },
    method: 'post',
    url: oktaDomain + '/oauth2/v1/challenge',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: `client_id=${clientId}&mfa_token=${req.session.mfaToken}&challenge_types_supported=http://auth0.com/oauth/grant-type/mfa-oob&channel_hint=push`
  }

  try {
    const response = await axios.request(options);
    if (response.status)
      // when Okta responds with 403 forbidden
      // mfa is required and mfa_token is issued
      if (response.status === 200) {
        req.session.oob_code = response.data.oob_code;
        res.redirect(302, '/auth/factor-polling-load')
      } else {
        console.log(response.data);
        res.render('error', {
          errorMessage: 'push error!',
        })
      }
    } catch (error) {
      console.error(error);
      res.render('error', {
        errorMessage: error,
      })
    }
})

// show a page during the factor interaction
// This page has client-side JS to poll server-side to check the result of interaction
router.get('/factor-polling-load', async (req, res) => {
  res.render('auth/mfa-polling')
})

// client-side JS calls this endpoint to check polling result
router.post('/mfa-polling-check', async (req, res) => {
  const options = {
    // not to raise error for 403 or 401 status
    validateStatus: function (status) {
      return status < 500; // Resolve only if the status code is less than 500
    },
    method: 'post',
    url: oktaDomain + '/oauth2/v1/token',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: `client_id=${clientId}&scope=openid%20profile&grant_type=http://auth0.com/oauth/grant-type/mfa-oob&oob_code=${req.session.oob_code}&mfa_token=${req.session.mfaToken}`
  }

  try {
    const response = await axios.request(options);
      console.log(response.status)
      console.log(response.data);
      if (response.data.id_token) {
        req.session.isOktaAuthenticated = true;
        res.status(200).json({originalUrl: req.session.originalUrl});
      } else {
        res.sendStatus(202);
      }
    } catch (error) {
      console.error(error);
      res.render('error', {
        errorMessage: error,
      })
    }
})

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect(302, '/')
})

module.exports = router