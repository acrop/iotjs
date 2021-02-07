/* Copyright 2015-present Samsung Electronics Co., Ltd. and other contributors
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

'use strict';

var colors = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',

  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgBlue: '\x1b[34m',
};

/**
 * @typedef { object } TestCase
 *
 * @property { TestSuite } parent - the test suite belong to
 * @property { string } title - the test suite title
 * @property { function } runner - the tests for running
 * @property { Error } beforeEachError
 * @property { Error } afterEachError
 * @property { Error } failedReason
 * @property { number } timeout - testcase timeout (in milliseconds)
 * @property { number } startTime - start time
 * @property { number } stopTime - stop time
 * @property { boolean } passed - count if test passed
 */

/**
 * @typedef { object } TestSuite
 *
 * @property { function } beforeAll
 * @property { function } afterAll
 * @property { function } beforeEach
 * @property { function } afterEach
 * @property { Error } beforeAllError
 * @property { Error } afterAllError
 * @property { number } beforeAllTimeout - default suite timeout (in milliseconds), for testcase before* after*
 * @property { number } afterAllTimeout - default suite timeout (in milliseconds), for testcase before* after*
 * @property { number } beforeEachTimeout - default suite timeout (in milliseconds), for testcase before* after*
 * @property { number } afterEachTimeout - default suite timeout (in milliseconds), for testcase before* after*

 * @property { TestSuite } parent - the parent test suite belong to
 * @property { TestCase[] } tests - the children tests for running
 * @property { TestSuite[] } suites - the children test suites for running
 * @property { string } title - the test suite title
 * @property { number } timeout - default suite timeout (in milliseconds), for testcase before* after*
 * @property { number } level - the depth of the nested "describe"
 * @property { number } count - total count of the tests
 * @property { number } passed - count of passed tests
 * @property { number } failed - count of failed tests
 * @property { number } startTime - start time
 * @property { number } stopTime - stop time
 */

/**
 * Create an TestCase
 *
 * @param { TestSuite } parent
 * @param { string } title
 * @param { function } runner
 *
 * @return { TestCase }
 */
function createTestCase(parent, title, runner, timeout) {
  return {
    parent: parent,
    title: title,
    runner: runner,
    timeout: timeout || parent.timeout,
  };
}

/**
 * Create an TestSuite
 *
 * @param {TestSuite} parent
 * @param {string} title
 * @param { number } timeout - test suite timeout (in milliseconds)
 * @return { TestSuite }
 */
function createTestSuite(parent, title, timeout) {
  var finalTimeout = typeof timeout === 'number' ? timeout : parent.timeout;
  return {
    beforeAll: undefined,
    afterAll: undefined,
    beforeEach: undefined,
    afterEach: undefined,

    parent: parent,
    tests: [],
    suites: [],
    title: title,
    level: parent === undefined ? 0 : parent.level + 1,
    count: 0,
    passed: 0,
    failed: 0,
    timeout: finalTimeout,
  };
}

/** @type { TestSuite } */
var rootSuite = createTestSuite(undefined, 'root test suite', 5000);

/** @type { TestSuite } */
var currentSuite = rootSuite;

/**
 * Execute before running tests.
 *
 * @param { number } timeout - beforeAll timeout (in milliseconds)
 * @param { function } fn
 */
function beforeAll(fn, timeout) {
  if (typeof fn !== 'function') {
    throw new Error('first parameter of beforeAll should be function');
  }
  if (currentSuite.beforeAll !== undefined) {
    throw new Error('Each test suite can only have a single beforeAll');
  }
  currentSuite.beforeAll = fn;
  currentSuite.beforeAllTimeout = timeout || currentSuite.timeout;
}

/**
 * Execute after running tests.
 *
 * @param { number } timeout - afterAll timeout (in milliseconds)
 * @param { function } fn
 */
function afterAll(fn, timeout) {
  if (typeof fn !== 'function') {
    throw new Error('first parameter of afterAll should be function');
  }
  if (currentSuite.afterAll !== undefined) {
    throw new Error('Each test suite can only have a single afterAll');
  }
  currentSuite.afterAll = fn;
  currentSuite.afterAllTimeout = timeout || currentSuite.timeout;
}

/**
 * Execute before each test case.
 *
 * @param { number } timeout - beforeEach timeout (in milliseconds)
 * @param { function } fn
 */
function beforeEach(fn, timeout) {
  if (typeof fn !== 'function') {
    throw new Error('first parameter of beforeEach should be function');
  }
  if (currentSuite.beforeEach !== undefined) {
    throw new Error('Each test suite can only have a single beforeEach');
  }
  currentSuite.beforeEach = fn;
  currentSuite.beforeEachTimeout = timeout || currentSuite.timeout;
}

/**
 * Execute after each test case.
 *
 * @param { number } timeout - afterEach timeout (in milliseconds)
 * @param { function } fn
 */
function afterEach(fn, timeout) {
  if (typeof fn !== 'function') {
    throw new Error('first parameter of afterEach should be function');
  }
  if (currentSuite.afterEach !== undefined) {
    throw new Error('Each test suite can only have a single afterEach');
  }
  currentSuite.afterEach = fn;
  currentSuite.afterEachTimeout = timeout || currentSuite.timeout;
}

/**
 * Runs a group of tests
 *
 * @param { string    } title - description of the test group
 * @param { function  } runner - contains a `describe` functions
 * @param { number } timeout - contains an assertion
 */
function describe(title, runner, timeout) {
  if (typeof title !== 'string') {
    throw new Error('first parameter of describe should be string to describle the suite');
  }
  if (typeof runner !== 'function') {
    throw new Error('second parameter of describe should be an function to initialize the suite');
  }
  var savedCurrentSuite = currentSuite;
  currentSuite = createTestSuite(savedCurrentSuite, title, timeout);
  savedCurrentSuite.suites.push(currentSuite);
  runner();
  savedCurrentSuite.count += currentSuite.count;
  currentSuite = savedCurrentSuite;
}

/**
 * Runs an assertion function
 *
 * @param { string   } title   - test description
 * @param { function  } runner - contains a `test` functions
 * @param { number } timeout - contains an assertion
 */
function test(title, runner, timeout) {
  if (typeof title !== 'string') {
    throw new Error('first parameter of test should be string to describle the test');
  }
  if (typeof runner !== 'function') {
    throw new Error('second parameter of test should be function');
  }
  currentSuite.tests.push(createTestCase(currentSuite, title, runner, timeout));
  currentSuite.count += 1;
}

/**
 * Gets an indentation depending on the "describe" level
 *
 * @param { TestSuite } suite
 * @return { string }
 */
function indentation(suite) {
  var i;
  var str = '';
  for (i = 0; i < 2 * suite.level; i += 1) {
    str += ' ';
  }
  return str;
}

/**
 * Logs a message to the console with a proper indentation
 *
 * @param { TestSuite } suite
 * @param { string } message
 */
function log(suite, message) {
  console.log(indentation(suite) + message);
}

/**
 * Logs a successful test
 *
 * @param { TestSuite } suite
 * @param { string } message - success message
 */
function logSuccess(suite, message) {
  console.log(indentation(suite) + colors.FgGreen + message + colors.Reset);
}

/**
 * Logs a failed test
 *
 * @param { TestSuite } suite
 * @param { string } message - error message
 */
function logError(suite, message) {
  console.log(indentation(suite) + colors.FgRed + message + colors.Reset);
}

/**
 * Composes the test summary message
 *
 * @param { TestSuite } suite
 * @param { number } time - the total test time
 */
function getStatsSummary(suite, time) {
  var passedColor = suite.passed === suite.count ? colors.FgGreen : colors.FgBlue;
  var passedText = passedColor +
        'Passed: ' +
        suite.passed +
        ' of ' +
        suite.count +
        colors.Reset;

  var failedText = suite.failed
    ? colors.FgRed + 'Failed: ' + suite.failed + colors.Reset
    : 'Failed: ' + suite.failed;

  return passedText + ', ' + failedText + ' (' + time + ' ms)';
}

function printSummary() {
  var time = rootSuite.stopTime - rootSuite.startTime;
  var summary = getStatsSummary(rootSuite, time);
  var failed = rootSuite.failed;

  log(rootSuite, summary);

  process.exit(failed === 0 ? 0 : -1);
}

/**
 * Run a function consider callback and Promise
 *
 * @param { function } fn
 * @param { function } done
 */
function runFunction(fn, done, timeout) {
  var doneCalled = false;
  var timer = setTimeout(function() {
    timer = undefined;
    doneWrapper(new Error('Timeout when running function' + fn));
  }, timeout);
  function doneWrapper(err) {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (!doneCalled) {
      doneCalled = true;
      done(err);
    }
  }
  if (typeof fn !== 'function') {
    doneWrapper();
    return;
  }
  try {
    if (fn.length === 1) {
      fn(doneWrapper);
    } else {
      var result = fn();
      if (typeof Promise === 'function') {
        // eslint-disable-next-line no-undef
        Promise.resolve(result)
          .then(function() {
            doneWrapper();
          }, doneWrapper);
      } else {
        doneWrapper();
      }
    }
  } catch (err) {
    doneWrapper(err);
  }
}

/**
 * Running a single test case
 *
 * @param { TestSuite } suite
 * @param { number } i The test case index in suite.tests
 * @param { function } onTestCaseDone - callback when single test case are executed
 */
function runTestCase(suite, i, onTestCaseDone) {
  var test = suite.tests[i];
  test.startTime = Date.now();
  stepBeforeEach();
  function stepBeforeEach() {
    runFunction(suite.beforeEach, stepBeforeEachDone, suite.beforeEachTimeout);
  }
  function stepBeforeEachDone(error) {
    if (error) {
      test.beforeEachError = error;
      return stepOnError(error);
    }
    stepTestCase();
  }

  function stepTestCase() {
    runFunction(test.runner, stepTestCaseDone, test.timeout);
  }
  function stepTestCaseDone(error) {
    if (error) {
      test.failedReason = error;
      return stepOnError(error);
    }
    stepAfterEach();
  }

  function stepAfterEach() {
    runFunction(suite.afterEach, stepAfterEachDone, suite.afterEachTimeout);
  }
  function stepAfterEachDone(error) {
    if (error) {
      test.afterEachError = error;
      return stepOnError(error);
    }
    stepStatistics();
  }

  function stepOnError(error) {
    if (test.failedReason === undefined) {
      test.failedReason = error;
    }
    stepStatistics();
  }

  function stepStatistics() {
    test.stopTime = Date.now();
    logTest(suite, test);
    onTestCaseDone();
  }
}

/**
 * Running a single test case
 *
 * @param { TestSuite } suite
 * @param { TestCase } test
 */
function logTest(suite, test) {
  var time = test.stopTime - test.startTime;
  var failedReason = test.failedReason;
  if (failedReason) {
    logError(suite, colors.FgRed + '❌ ' + test.title + ' (' + time + 'ms)' + colors.Reset);
    var errorMessage = failedReason.toString() + failedReason.stack;
    console.log(colors.FgRed + errorMessage + colors.Reset);
  } else {
    logSuccess(suite, colors.FgGreen + '✅ ' + test.title + ' (' + time + 'ms)' + colors.Reset);
  }
}

/**
 * Create a wrapped function for running a single testcase
 *
 * @param { TestSuite } suite
 * @param { number } i The test case index in suite.tests
 * @param { function } onTestCaseDone - callback when single test case are executed
 */
function createOnTestCaseDone(suite, i, onTestCaseDone) {
  return function() {
    return runTestCase(suite, i, onTestCaseDone);
  };
}

/**
 * Running a single test suite
 *
 * @param { TestSuite } suite
 * @param { function } onTestCastListDone - callback when all test case are executed
 */
function runTestCaseList(suite, onTestCastListDone) {
  var currentOnTestCaseDone = onTestCastListDone;
  for (var i = suite.tests.length - 1; i >= 0; i -= 1) {
    currentOnTestCaseDone = createOnTestCaseDone(
      suite,
      i,
      currentOnTestCaseDone
    );
  }
  currentOnTestCaseDone();
}

/**
 * Running a single test suite
 *
 * @param { TestSuite } suite
 * @param { function } onTestSuiteDone - callback when test suite are executed
 */
function runTestSuite(suite, onTestSuiteDone) {
  suite.startTime = Date.now();
  var colorBegin = colors.FgBlue;
  if (suite.level === 0) {
    colorBegin = colors.Bright;
  }
  log(suite, colorBegin + suite.title + colors.Reset);
  stepBeforeAll();

  function stepBeforeAll() {
    runFunction(suite.beforeAll, stepBeforeAllDone, suite.beforeAllTimeout);
  }
  function stepBeforeAllDone(error) {
    if (error) {
      suite.beforeAllError = error;
      return stepOnError(error);
    }
    stepTestCaseList();
  }

  function stepTestCaseList() {
    runTestCaseList(suite, stepTestCaseListDone);
  }
  function stepTestCaseListDone() {
    stepTestSuiteList();
  }

  function stepTestSuiteList() {
    runTestSuiteList(suite, stepTestSuiteListDone);
  }
  function stepTestSuiteListDone() {
    stepAfterAll();
  }

  function stepAfterAll() {
    runFunction(suite.afterAll, stepAfterAllDone, suite.afterAllTimeout);
  }
  function stepAfterAllDone(error) {
    if (error) {
      suite.afterAllError = error;
      return stepOnError(error);
    }
    stepStatistics();
  }

  function stepOnError(error) {
    for (var i = 0; i < suite.tests.length; i += 1) {
      if (suite.tests[i].failedReason === undefined) {
        suite.tests[i].failedReason = error;
      }
    }
    stepStatistics();
  }

  function stepStatistics() {
    var i;
    suite.stopTime = Date.now();
    var time = suite.stopTime - suite.startTime;
    log(suite, colorBegin + suite.title + ' (' + time + 'ms)' + colors.Reset);
    for (i = 0; i < suite.suites.length; i += 1) {
      suite.failed += suite.suites[i].failed;
      suite.passed += suite.suites[i].passed;
    }
    for (i = 0; i < suite.tests.length; i += 1) {
      if (suite.tests[i].failedReason === undefined) {
        suite.passed += 1;
      } else {
        suite.failed += 1;
      }
    }
    onTestSuiteDone();
  }
}

/**
 * Create a wrapped function for running a single test suite
 *
 * @param { TestSuite } suite the test suite to executed
 * @param { function } onTestSuiteDone - callback when single test suite are executed
 */
function createOnTestSuiteDone(suite, onTestSuiteDone) {
  return function() {
    return runTestSuite(suite, onTestSuiteDone);
  };
}

/**
 * Running a list of test suites
 *
 * @param { TestSuite } suite
 * @param { function } onTestSuiteListDone - callback when all test suite are executed
 */
function runTestSuiteList(suite, onTestSuiteListDone) {
  var currentOnTestSuiteDone = onTestSuiteListDone;
  for (var i = suite.suites.length - 1; i >= 0; i -= 1) {
    currentOnTestSuiteDone = createOnTestSuiteDone(
      suite.suites[i],
      currentOnTestSuiteDone
    );
  }
  currentOnTestSuiteDone();
}

function runAllTestSuite() {
  runTestSuite(rootSuite, printSummary);
}

setTimeout(runAllTestSuite, 0);

module.exports = {
  describe: describe,
  test: test,
  it: test,
  beforeAll: beforeAll,
  afterAll: afterAll,
  beforeEach: beforeEach,
  afterEach: afterEach,
};

globalThis.describe = describe;
globalThis.test = test;
globalThis.it = test;
globalThis.beforeAll = beforeAll;
globalThis.afterAll = afterAll;
globalThis.beforeEach = beforeEach;
globalThis.afterEach = afterEach;
