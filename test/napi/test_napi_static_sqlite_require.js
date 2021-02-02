'use strict';
var assert = require('assert');
var net = require('net');
console.log('net:', net);
var err;
try {
  var sqlite3 = require('sqlite3');
  console.log('sqlite3:', Object.keys(sqlite3));
} catch (error) {
  err = error;
}
if (typeof Symbol === 'undefined') {
  console.log(err.message);
  assert.equal(err.message, 'Symbols are not supported by this build.');
} else {
  console.log('Support for Symbol, so the require have no error');
  assert.equal(err, undefined);
}
console.log('sqlite3 required');
