/* Copyright 2017-present Samsung Electronics Co., Ltd. and other contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var assert = require('assert');
require('jest');

beforeAll(function(done) {
  console.log('basic root beforeAll');
  done();
});

afterAll(function(done) {
  console.log('basic root afterAll');
  done();
});

beforeEach(function(done) {
  console.log('basic root beforeEach');
  done();
});

afterEach(function(done) {
  console.log('basic root afterEach');
  done();
});

test('first test', function(done) {
  console.log('root first test');
  assert.equal(1, 1);
  done();
});

test('second test', function(done) {
  console.log('root second test');
  assert.equal(1, 1);
  done();
});

console.log('basic scan root');

describe('suite 1', function() {
  console.log('basic scan suite 1');
  beforeAll(function(done) {
    console.log('\nsuite 1 beforeAll');
    done();
  });

  afterAll(function() {
    console.log('suite 1 afterAll\n');
  });

  beforeEach(function() {
    console.log('suite 1 beforeEach');
    if (typeof Promise === 'function') {
      // eslint-disable-next-line no-undef
      return Promise.resolve();
    }
  });

  afterEach(function(done) {
    console.log('suite 1 afterEach');
    done();
  });

  test('first test', function(done) {
    console.log('suite 1 first test');
    assert.equal(1, 1);
    done();
  });

  test('second test', function() {
    console.log('suite 1 second test');
    console.log('❌');
    assert.equal(1, 1);
    if (typeof Promise === 'function') {
        // eslint-disable-next-line no-undef
        return Promise.resolve();
    }
  });

  test('third test', function() {
    assert.equal(1, 1);
  });

  describe('suite 1 nested 1', function() {
    console.log('basic scan suite nested 1');
    beforeAll(function(done) {
      console.log('basic run 3');
      done();
    });

    afterAll(function(done) {
      console.log('basic run 1');
      done();
    });

    beforeEach(function(done) {
      console.log('basic run 2');
      done();
    });

    afterEach(function(done) {
      console.log('basic run 2');
      done();
    });

    test('first test', function(done) {
      assert.equal(1, 1);
      done();
    });

    test('second test', function(done) {
      assert.equal(1, 1);
      done();
    });
  });

  describe('suite 1 nested 2', function() {
    console.log('basic scan suite nested 2');
  });
});

describe('suite 2', function() {
  console.log('basic scan suite 2');
  beforeAll(function(done) {
    console.log('basic run 4');
    done();
  });

  afterAll(function(done) {
    console.log('basic run 1');
    done();
  });

  beforeEach(function(done) {
    console.log('basic run 2');
    done();
  });

  afterEach(function(done) {
    console.log('basic run 2');
    done();
  });

  describe('suite 2 nested 1', function() {
    console.log('basic scan suite 2 nested 1');

    describe('suite 2 nested 1 nested 1', function() {
      console.log('basic scan suite 2 nested 1 nested 1');
    });
  });

  test('first test', function() {
    assert.equal(1, 1);
  });

  test('second test', function() {
    assert.equal(1, 1);
  });
});

describe('Level 1', function() {
  describe('Level 2', function() {
      describe('Level 3', function() {
          describe('Level 4', function() {
              describe('Level 5', function() {
                  test('"deep nested function"', function() {});
              });
          });
      });
  });
});
