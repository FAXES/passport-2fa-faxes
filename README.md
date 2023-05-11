This module lets you authenticate using a username, password and TOTP code in your Node.js applications. By plugging into Passport, 2FA TOTP authentication can be easily and unobtrusively integrated into any application or framework that supports [Connect](http://www.senchalabs.org/connect/)-style middleware, including [Express](http://expressjs.com/). You can use any TOTP code generators to generate one-time passwords, for example [Google Authenticator](https://github.com/google/google-authenticator).

**Key Changes From Original:**
- Added `GoogleAuthenticator.verify()` function.
- Added `totpOptional` to allow accounts to succeed authentication without 2FA being attached on the account, but if it is, it will require it.
- Added `removeUserKeys` as an option to remove the defines keys from the users session object. for example, if you return a whole DB entry, you can here remove sensitive data like the password from the session object.
- Cleaned up some functions
- If `done()` function has `"UNREG"` passed as the third parameter it resolves with `removeUserKeys` option utilised.
- Performance changs and variable renaming.

## Install

```bash
$ npm install passport-2fa-faxes
```

## Usage

#### Configure Strategy

The 2FA TOTP authentication strategy authenticates a user using a username, password and TOTP value generated by a hardware device or software application (known as a token). The strategy requires a callback to verify a username and password and a callback to setup TOTP generator.

```js
var authenticator = require('passport-2fa-faxes').authenticator;
var TwoFAStartegy = require('passport-2fa-faxes').Strategy;

...

passport.use(new TwoFAStartegy(function (username, password, done) {
    // 1st step verification: username and password
    
    User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
    });
}, function (user, done) {
    // 2nd step verification: TOTP code from Google Authenticator
    
    if (!user.secret) {
        done(new Error("Google Authenticator is not setup yet."));
    } else {
        // Google Authenticator uses 30 seconds key period
        // https://github.com/google/google-authenticator/wiki/Key-Uri-Format
        
        var secret = authenticator.decodeSecret(user.secret);
        done(null, secret, 30);
    }
}));
```

#### Authenticator

Previously `GoogleAuthenticator`, this object services utility methods for authentication. This is tested with Google Authenticator. However, others like Microsoft Authenticator and Authy use the same logic and should work fine.

- `authenticator.register(username)` - Generates a secret key and render a QR code (SVG) to register an account in an authenticator app.
- `authenticator.decodeSecret(secret)` - Converts BASE 32 encoded string to byte array.
- `authenticator.verify(code, secret)` - Verify a 2FA code.


##### Strategy Options

This strategy takes an optional options hash before the function. Example:
```new TwoFAStartegy({/* options */, verifyUsernameAndPasswordCallback, verifyTotpCodeCallback})```

Here are the option available in the strategy:
- `usernameField` - Optional, defaults to 'username'
- `passwordField` - Optional, defaults to 'password'
- `codeField` - Optional, defaults to 'code'
- `window` - Optional defaults to 6. A window to generate TOTP code.
- `skipTotpVerification` - Optional defaults to false. TOTP code verification is skipped if it is set to be true.
- `passReqToCallback` - Optional defaults to false. Pass `request` object to the callbacks if it is set to be true.
- `totpOptional` - Optional defaults to false. Allow login to succeed, if no 2FA is present for account.
- `removeUserKeys` - Optional defaults to `[]`. Removed the defined keys from the req.user object in the session data.

#### Authenticate Requests

Use `passport.authenticate()`, specifying the '2fa-totp' strategy, to authenticate requests.

```js
router.post('/', passport.authenticate('2fa-totp', {
    successRedirect: '/',
    failureRedirect: '/login'
}));
```

### Credits

Originally created by Ilya Verbitskiy (ilich) in the package *`passport-2fa-totp`*. With edits made by FAXES and the [Weblutions](https://github.com/weblutions) team.