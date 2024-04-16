function isOktaAuthenticated(req, res, next) {
  if (req.session?.isOktaAuthenticated) {
    next();
  } else {
    req.session.originalUrl = req.originalUrl;
    res.redirect('/auth/login');
  }
}

module.exports = {
  isOktaAuthenticated
}