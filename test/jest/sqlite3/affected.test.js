var sqlite3 = require('sqlite3');
var assert = require('assert');
require('jest');

describe('query properties', function() {
    var db;
    beforeEach(function(done) {
        db = new sqlite3.Database(':memory:');
        db.run("CREATE TABLE foo (id INT, txt TEXT)", done);
    });

    afterEach(function(done) {
        db.close(done)
    });

    it('should return the correct lastID', function(done) {
        var stmt = db.prepare("INSERT INTO foo VALUES(?, ?)");
        var j = 1;
        for (var i = 0; i < 5000; i++) {
            stmt.run(i, "demo", function(err) {
                if (err) throw err;
                // Relies on SQLite's row numbering to be gapless and starting
                // from 1.
                assert.equal(j++, this.lastID);
            });
        }
        stmt.finalize();
        db.wait(done);
    }, 200000);

    it('should return the correct changes count', function(done) {
        var stmt = db.prepare("INSERT INTO foo VALUES(?, ?)");
        var j = 1;
        for (var i = 0; i < 100; i++) {
            stmt.run(i, "demo", function(err) {
                if (err) throw err;
                // Relies on SQLite's row numbering to be gapless and starting
                // from 1.
                assert.equal(j++, this.lastID);
            });
        }
        stmt.finalize();
        db.wait(checkUpdate);
        function checkUpdate() {
            db.run("UPDATE foo SET id = id + 1 WHERE id % 2 = 0", function(err) {
                if (err) throw err;
                assert.equal(50, this.changes);
                done();
            });
        }
    });
});
