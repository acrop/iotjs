'use strict';
var assert = require('assert');

var common = require('common.js');

var err;
try {
  var binding = require('./build/' + common.buildTypePath +
    '/test_napi_throw_in_init_return_null.node');
  console.log(binding);
} catch (error) {
  err = error;
}

assert.equal(err.message,
  'Directly raise exception when import napi native module and return NULL');
console.log((err.stack || []).join('\n'));
