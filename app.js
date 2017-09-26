var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: '',
    clientSecret: '',
    callbackURL: '',
    profileFields: [
      'id',
      'displayName',
      'gender',
      'email',
      'photos',
      'link',
      'locale',
      'timezone'
    ]
  },
  function(accessToken, refreshToken, profile, cb) {

    var user = {
      id: profile.id,
      displayName: profile.displayName,
      gender: profile.gender,
      email: profile.emails[0].value,
      provider : profile.provider,
      locale: profile._json.locale,
      timezone: profile._json.timezone,
      profileUrl: profile.profileUrl,
      photo: profile.photos[0].value,

    };

    console.log(user);
    return cb(null, user);
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

var app = express();




app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.set('views', 'views');


app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(require('cookie-parser')());
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));


app.use(require('./movieRouter'));
app.use(handleError);

app.get('/',
  function(req, res){
    res.render('login');
  });

app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/login/facebook/return',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.render('profile', { user: req.user });
  });


app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.get('/logout', function(req, res){
  req.logout();
     res.redirect('/');
   });


function handleError(err, req, res, next) {
   res.status(err.code).send({msg:err.message});
}
app.listen(80);