express-with-cas-auth
=====================

Example Express application with CAS authentication

### Install

    $ npm install

### Start application

    $node app.js

### Configure CAS

Change the parameter ssoBaseURL to point to your CAS server.

    passport.use(new (require('passport-cas-kth').Strategy)({
            ssoBaseURL: 'https://your.login.server.com',
            serverBaseURL: 'http://localhost:3000'
        }, function(user, done) {
            console.log("user: " + user);
            return done(null, user);
        }
    ));

### Test application

    Go to http://localhost:3000 and click on the link to the CAS protected page.