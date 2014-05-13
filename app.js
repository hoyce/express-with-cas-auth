var http = require('http');
var express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var expressSession = require("express-session");
var passport = require("passport");

/****************** Application ******************/
var app = express();

/****************** Middleware ******************/
app.use(bodyParser())
app.use(cookieParser());
app.use(expressSession({secret: "a-very-secret-string"}));

/****************** Authentication ******************/

/**
 * In a Express-based application, passport.initialize() middleware is required to initialize Passport.
 * If your application uses persistent login sessions, passport.session() middleware must also be used.
 */
app.use(passport.initialize());

/**
 * In a typical web application, the credentials used to authenticate a user will only be transmitted during the
 * login request. If authentication succeeds, a session will be established and maintained via a cookie set
 * in the user's browser.

 * Each subsequent request will not contain credentials, but rather the unique cookie that identifies the session.
 * In order to support login sessions, Passport will serialize and deserialize user instances to and from the session.
 */
app.use(passport.session());

/**
 * Passport will maintain persistent login sessions. In order for persistent sessions to work, the authenticated
 * user must be serialized to the session, and deserialized when subsequent requests are made.
 *
 * Passport does not impose any restrictions on how your user records are stored. Instead, you provide functions
 * to Passport which implements the necessary serialization and deserialization logic. In a typical
 * application, this will be as simple as serializing the user ID, and finding the user by ID when deserializing.
 */
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

/**
 * Before asking Passport to authenticate a request, the strategy (or strategies) used by an application must
 * be configured.
 *
 * Strategies, and their configuration, are supplied via the use() function. For example, the following uses
 * the passport-cas strategy for CAS authentication.
 */
passport.use(new (require('passport-cas-kth').Strategy)({
        ssoBaseURL: 'https://login-r.referens.sys.kth.se',
        serverBaseURL: 'http://localhost:3000'
    }, function(user, done) {
        console.log("user: " + user);
        return done(null, user);
    }
));


app.use('/login', function(req, res, next) {
    /**
     * Authenticating requests is as simple as calling passport.authenticate() and specifying which strategy to employ.
     * authenticate()'s function signature is standard Connect middleware, which makes it convenient to use as
     * route middleware in Express applications.
     */
    passport.authenticate('cas',

        /*
         * Custom Callback for success. If the built-in options are not sufficient for handling an authentication request,
         * a custom callback can be provided to allow the application to handle success or failure.
         */
        function (err, user, info) {

            if (err) { return next(err); }

            if (!user) { return res.redirect('/login'); }

            req.logIn(user, function (err) {
                if (err) { return next(err); }

                console.log("Logged in user, redirecting...");
                return res.redirect(req.param('nextUrl')); // 4
            });
        }
    )(req, res, next);
    //console.log("Cas authentication initiated...");
});

/**
 * Logout from application.
 */
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

/**
 * Check if the user is logged in. If logged in, pass to next,
 * else redirect to the login server.
 */
app.login = function(req, res, next) {
    if (req.user) {
        next();
    } else {
        req.nextUrl = req.url;
        return res.redirect('/login?nextUrl=' + req.nextUrl);
    }
};

/****************** Routes ******************/

app.get("/", function(req, res) {
    res.send("<a href='/admin/index'>To the CAS protected page</a>");
});

app.get("/admin", app.login);
app.all("/admin/*", app.login);
app.get('/admin/index', function(req, res) {
    res.send("User: " + req.user);
});

// utility function, see if a specific port has been selected or if to use default port 3000.
app.getPort = function () {
    return Number(process.env.PORT || 3000);
}

/****************** Start  ******************
 *
 * Start the application and listen for incoming requests.
 * If your app needs SSL start it by creating a node server directly.
 * var https = require("https"); https.createServer(app).listen(443);
 */
app.listen(app.getPort(), function() {
    console.log("---------------------------")
    console.log("Application running on::");
    console.log("http://localhost:" + app.getPort());
    console.log("---------------------------")
});
