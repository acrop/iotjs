'use strict';
var assert = require('assert');

var err;
try {
    var in_init_static = require('napi__raise_on_init');
    console.log(in_init_static);
} catch (error) {
  err = error;
}

assert.equal(err.message,
  'Directly raise exception when import napi native static module');
console.log((err.stack || []).join('\n'));
