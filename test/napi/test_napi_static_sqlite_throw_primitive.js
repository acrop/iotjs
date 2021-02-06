'use strict';
console.log('hello, the world');
console.log('sqlite3');
var net = require('net');
console.log('net:', net);
var sqlite3 = require('sqlite3');
console.log('sqlite3 required');
console.log('sqlite3:', Object.keys(sqlite3));

var db;
db = new sqlite3.Database(':memory:');
function done() {
  // '; // only numbers can appear
  throw new Error(
    'throw a very long string stringstringstringstringstringstringstri'
    + 'ngstringstringstringstringstringstringstringstring'
  );
}

db.run('CREATE TABLE foo (id INT, txt TEXT)', done);
