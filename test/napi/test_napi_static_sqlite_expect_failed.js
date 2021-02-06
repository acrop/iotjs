'use strict';
console.log('hello, the world');
console.log('sqlite3');
var net = require('net');
console.log('net:', net);
var sqlite3 = require('sqlite3');
console.log('sqlite3 required');
console.log('sqlite3:', Object.keys(sqlite3));

var assert = require('assert');

var db;
db = new sqlite3.Database(':memory:');
function done() {
  var stmt = db.prepare('INSERT INTO foo VALUES(?, ?)');
  var j = 1;
  for (var i = 0; i < 10; i++) {
    stmt.run(i, 'demo', function(err) {
      if (err) throw err;
      // Relies on SQLite's row numbering to be gapless and starting
      // from 1.
      assert.equal(j++, this.lastID + 1);
    });
  }
  // TODO: when stmt unref, calling to finalize directly if not called,
  // no explict call to finalize should cause memory leak on exit
  stmt.finalize();
}

function done_again() {
  console.log('done_again');
}

db.run('CREATE TABLE foo (id INT, txt TEXT)', done);
db.wait(done_again);
