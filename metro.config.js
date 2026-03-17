/**
 * METRO BUNDLER CONFIG
 * 
 * Metro is the JavaScript bundler for React Native.
 * This file configures how Metro processes your code.
 * 
 * We're using the default Expo config here.
 */

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
