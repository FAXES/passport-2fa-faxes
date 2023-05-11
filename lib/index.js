'use strict';

var Strategy = require('./strategy'),
authenticator = require('./authenticator');

exports = module.exports = Strategy;
exports.Strategy = Strategy;
exports.GoogeAuthenticator = authenticator;
exports.authenticator = authenticator;