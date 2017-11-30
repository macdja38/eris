/*
Copyright Node.js contributors. All rights reserved.

    Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE. */

'use strict';
const util = require("util");
const kCode = Symbol('code');
const kInfo = Symbol('info');

const messages = new Map();

class AssertionError extends Error {
    constructor(options) {
        if (typeof options !== 'object' || options === null) {
            throw new exports.TypeError('ERR_INVALID_ARG_TYPE', 'options', 'Object');
        }
        let { actual, expected, message, operator, stackStartFunction } = options;
        if (message) {
            super(message);
        } else {
            if (actual && actual.stack && actual instanceof Error)
                actual = `${actual.name}: ${actual.message}`;
            if (expected && expected.stack && expected instanceof Error)
                expected = `${expected.name}: ${expected.message}`;
            super(`${util.inspect(actual).slice(0, 128)} ` +
                `${operator} ${util.inspect(expected).slice(0, 128)}`);
        }

        this.generatedMessage = !message;
        this.name = 'AssertionError [ERR_ASSERTION]';
        this.code = 'ERR_ASSERTION';
        this.actual = actual;
        this.expected = expected;
        this.operator = operator;
        Error.captureStackTrace(this, stackStartFunction);
    }
}


// This is defined here instead of using the assert module to avoid a
// circular dependency. The effect is largely the same.
function internalAssert(condition, message) {
    if (!condition) {
        throw new AssertionError({
            message,
            actual: false,
            expected: true,
            operator: '==',
        });
    }
}

function message(key, args) {
    const msg = messages.get(key);
    internalAssert(msg, `An invalid error message key was used: ${key}.`);
    let fmt;
    if (typeof msg === 'function') {
        fmt = msg;
    } else {
        fmt = util.format;
        if (args === undefined || args.length === 0)
            return msg;
        args.unshift(msg);
    }
    return String(fmt.apply(null, args));
}


function makeErisError(Base) {
    return class NodeError extends Base {
        constructor(key, ...args) {
            super(message(key, args));
            Object.defineProperty(this, kCode, {
                configurable: true,
                enumerable: false,
                value: key,
                writable: true,
            });
        }

        get name() {
            return `${super.name} [${this[kCode]}]`;
        }

        /**
         * Set a value for the name
         * @param {string} value
         */
        set name(value) {
            Object.defineProperty(this, 'name', {
                configurable: true,
                enumerable: true,
                value,
                writable: true,
            });
        }

        get code() {
            return this[kCode];
        }

        set code(value) {
            Object.defineProperty(this, 'code', {
                configurable: true,
                enumerable: true,
                value,
                writable: true,
            });
        }
    };
}

// Utility function for registering the error codes. Only used here. Exported
// *only* to allow for testing.
function E(sym, val) {
    messages.set(sym, typeof val === 'function' ? val : String(val));
}

module.exports = exports = {
    message,
    ErisError: makeErisError(Error),
    ErisTypeError: makeErisError(TypeError),
    ErisRangeError: makeErisError(RangeError),
    AssertionError,
    E // This is exported only to facilitate testing.
};