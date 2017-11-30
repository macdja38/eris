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

const messages = new Map();

class AssertionError extends Error {
    constructor(options) {
        if (typeof options !== 'object' || options === null) {
            throw new exports.TypeError('ERR_INVALID_ARG_TYPE', 'options', 'Object');
        }
        var { actual, expected, message, operator, stackStartFunction } = options;
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

E("ERISERR_INVALID_FILE", "Invalid file object provided, file must be an array or have a .file property");
E("ERISERR_REQUEST_TIMEOUT", "Request timed out on %s %s");
E("ERISERR_CLOCK_DSYNC", "Your clock is %sms behind Discord's server clock. Please check your connection and system time.");
E("ERISERR_UNHANDLED_MESSAGE_CREATE", "Unhandled MESSAGE_CREATE type: %s");
E("ERISERR_UNRECOGNISED_ACTION_TYPE", "Unrecognized action type: %s");
E("ERISERR_USER_OF_MEMBER_NOT_FOUND", "User associated with Member not found: %s");
E("ERISERR_MISSING_CLIENT_IN_CONSTRUCTOR", "Missing client in constructor");
E("ERISERR_INVALID_STATUS_CODE", "Rest request returned without a status code");
E("ERISERR_REQUEST_ABORTED_BY_CLIENT", "Request aborted by client on %s %s");
E("ERISERR_REQUEST_ABORTED_BY_SERVER", "Request aborted by server on %s %s");
E("ERISERR_MISSING_OBJECT_ID", "Missing object id");
E("DISCORD_INTERNAL_SERVER_ERROR", "Discord returned an Internal Server Error encountered making request to %s %s");
E("DISCORD_RESPONSE_UNKNOWN_ACCOUNT", "Unknown account");
E("DISCORD_RESPONSE_UNKNOWN_APPLICATION", "Unknown application");
E("DISCORD_RESPONSE_UNKNOWN_CHANNEL", "Unknown channel");
E("DISCORD_RESPONSE_UNKNOWN_GUILD", "Unknown guild");
E("DISCORD_RESPONSE_UNKNOWN_INTEGRATION", "Unknown integration");
E("DISCORD_RESPONSE_UNKNOWN_INVITE", "Unknown invite");
E("DISCORD_RESPONSE_UNKNOWN_MEMBER", "Unknown member");
E("DISCORD_RESPONSE_UNKNOWN_MESSAGE", "Unknown message");
E("DISCORD_RESPONSE_UNKNOWN_OVERWRITE", "Unknown overwrite");
E("DISCORD_RESPONSE_UNKNOWN_PROVIDER", "Unknown provider");
E("DISCORD_RESPONSE_UNKNOWN_ROLE", "Unknown role");
E("DISCORD_RESPONSE_UNKNOWN_TOKEN", "Unknown token");
E("DISCORD_RESPONSE_UNKNOWN_USER", "Unknown user");
E("DISCORD_RESPONSE_UNKNOWN_EMOJI", "Unknown Emoji");
E("DISCORD_RESPONSE_NO_BOT_ENDPOINT", "Bots cannot use this endpoint");
E("DISCORD_RESPONSE_BOT_ONLY_ENDPOINT", "Only bots can use this endpoint");
E("DISCORD_RESPONSE_MAX_GUILDS_REACHED", "Maximum number of guilds reached (100)");
E("DISCORD_RESPONSE_MAX_FRIENDS_REACHED", "Maximum number of friends reached (1000)");
E("DISCORD_RESPONSE_MAX_PINS_REACHED", "Maximum number of pins reached (50)");
E("DISCORD_RESPONSE_MAX_GUILD_ROLES_REACHED", "Maximum number of guild roles reached (250)");
E("DISCORD_RESPONSE_TOO_MANY_REACTIONS", "Too many reactions");
E("DISCORD_RESPONSE_MAX_GUILD_CHANNELS_REACHED", "Maximum number of guild channels reached (500)");
E("DISCORD_RESPONSE_UNAUTHORIZED", "Unauthorized");
E("DISCORD_RESPONSE_MISSING_ACCESS", "Missing access");
E("DISCORD_RESPONSE_INVALID_ACCOUNT_TYPE", "Invalid account type");
E("DISCORD_RESPONSE_CANNOT_EXECUTE_ACTION_ON_A_DM_CHANNEL", "Cannot execute action on a DM channel");
E("DISCORD_RESPONSE_WIDGET_DISABLED", "Widget Disabled");
E("DISCORD_RESPONSE_CANNOT_EDIT_ANOTHER_USER_MESSAGE", "Cannot edit a message authored by another user");
E("DISCORD_RESPONSE_CANNOT_SEND_AN_EMPTY_MESSAGE", "Cannot send an empty message");
E("DISCORD_RESPONSE_CANNOT_SEND_MESSAGES_TO_THIS_USER", "Cannot send messages to this user");
E("DISCORD_RESPONSE_CANNOT_SEND_MESSAGES_IN_A_VOICE_CHANNEL", "Cannot send messages in a voice channel");
E("DISCORD_RESPONSE_CHANNEL_VERIFICATION_LEVEL_IS_TOO_HIGH", "Channel verification level is too high");
E("DISCORD_RESPONSE_OAUTH2_APPLICATION_DOES_NOT_HAVE_A_BOT", "OAuth2 application does not have a bot");
E("DISCORD_RESPONSE_OAUTH2_APPLICATION_LIMIT_REACHED", "OAuth2 application limit reached");
E("DISCORD_RESPONSE_INVALID_OAUTH_STATE", "Invalid OAuth state");
E("DISCORD_RESPONSE_MISSING_PERMISSIONS", "Missing permissions");
E("DISCORD_RESPONSE_INVALID_AUTHENTICATION_TOKEN", "Invalid authentication token");
E("DISCORD_RESPONSE_NOTE_IS_TOO_LONG", "Note is too long");
E("DISCORD_RESPONSE_MESSAGES_OUT_OF_RANGE", "Provided too few or too many messages to delete. Must provide at least 2 and fewer than 100 messages to delete.");
E("DISCORD_RESPONSE_INVALID_PIN_CHANNEL", "A message can only be pinned to the channel it was sent in");
E("DISCORD_RESPONSE_CANNOT_EXECUTE_ACTION_ON_SYSTEM_MESSAGE", "Cannot execute action on a system message");
E("DISCORD_RESPONSE_MESSAGE_TOO_OLD_BULK_DELETE", "A message provided was too old to bulk delete");
E("DISCORD_RESPONSE_INVALID_FORM_BODY", "Invalid Form Body");
E("DISCORD_RESPONSE_APPLICATION_NOT_IN_INVITE_GUILD", "An invite was accepted to a guild the application's bot is not in");
E("DISCORD_RESPONSE_INVALID_API_VERSION", "Invalid API version");
E("DISCORD_RESPONSE_REACTION_BLOCKED", "Reaction blocked");
E("DISCORD_RESPONSE_UNKNOWN", "UNKNOWN response received from discord api please update eris");
E("DISCORD_HTTP_RESPONSE_OK", "The request completed successfully, %s");
E("DISCORD_HTTP_RESPONSE_CREATED", "The entity was created successfully, %s");
E("DISCORD_HTTP_RESPONSE_NO_CONTENT", "The request completed successfully but returned no content, code %s");
E("DISCORD_HTTP_RESPONSE_NOT_MODIFIED", "The entity was not modified (no action was taken), code %s");
E("DISCORD_HTTP_RESPONSE_BAD_REQUEST", "The request was improperly formatted, or the server couldn't understand it, code %s");
E("DISCORD_HTTP_RESPONSE_UNAUTHORIZED", "The Authorization header was missing or invalid, code %s");
E("DISCORD_HTTP_RESPONSE_FORBIDDEN", "The Authorization token you passed did not have permission to the resource, code %s");
E("DISCORD_HTTP_RESPONSE_NOT_FOUND", "The resource at the location specified doesn't exist, code %s");
E("DISCORD_HTTP_RESPONSE_METHOD_NOT_ALLOWED", "The HTTP method used is not valid for the location specified, code %s");
E("DISCORD_HTTP_RESPONSE_TOO_MANY_REQUESTS", "You've made too many requests, see Rate Limits, code %s");
E("DISCORD_HTTP_RESPONSE_GATEWAY_UNAVAILABLE", "There was not a gateway available to process your request. Wait a bit and retry. code %s");
E("DISCORD_HTTP_RESPONSE_SERVER_ERROR", "The server had an error processing your request (these are rare) code %s");
E("DISCORD_HTTP_RESPONSE_UNKNOWN", "UNKNOWN response received from discord api please update eris");

function hasCode(code) {
    return messages.has(code);
}

const discordResponses = new Map([
    [10001, "DISCORD_RESPONSE_UNKNOWN_ACCOUNT"],
    [10002, "DISCORD_RESPONSE_UNKNOWN_APPLICATION"],
    [10003, "DISCORD_RESPONSE_UNKNOWN_CHANNEL"],
    [10004, "DISCORD_RESPONSE_UNKNOWN_GUILD"],
    [10005, "DISCORD_RESPONSE_UNKNOWN_INTEGRATION"],
    [10006, "DISCORD_RESPONSE_UNKNOWN_INVITE"],
    [10007, "DISCORD_RESPONSE_UNKNOWN_MEMBER"],
    [10008, "DISCORD_RESPONSE_UNKNOWN_MESSAGE"],
    [10009, "DISCORD_RESPONSE_UNKNOWN_OVERWRITE"],
    [10010, "DISCORD_RESPONSE_UNKNOWN_PROVIDER"],
    [10011, "DISCORD_RESPONSE_UNKNOWN_ROLE"],
    [10012, "DISCORD_RESPONSE_UNKNOWN_TOKEN"],
    [10013, "DISCORD_RESPONSE_UNKNOWN_USER"],
    [10014, "DISCORD_RESPONSE_UNKNOWN_EMOJI"],
    [20001, "DISCORD_RESPONSE_NO_BOT_ENDPOINT"],
    [20002, "DISCORD_RESPONSE_BOT_ONLY_ENDPOINT"],
    [30001, "DISCORD_RESPONSE_MAX_GUILDS_REACHED"],
    [30002, "DISCORD_RESPONSE_MAX_FRIENDS_REACHED"],
    [30003, "DISCORD_RESPONSE_MAX_PINS_REACHED"],
    [30005, "DISCORD_RESPONSE_MAX_GUILD_ROLES_REACHED"],
    [30010, "DISCORD_RESPONSE_TOO_MANY_REACTIONS"],
    [30013, "DISCORD_RESPONSE_MAX_GUILD_CHANNELS_REACHED"],
    [40001, "DISCORD_RESPONSE_UNAUTHORIZED"],
    [50001, "DISCORD_RESPONSE_MISSING_ACCESS"],
    [50002, "DISCORD_RESPONSE_INVALID_ACCOUNT_TYPE"],
    [50003, "DISCORD_RESPONSE_CANNOT_EXECUTE_ACTION_ON_A_DM_CHANNEL"],
    [50004, "DISCORD_RESPONSE_WIDGET_DISABLED"],
    [50005, "DISCORD_RESPONSE_CANNOT_EDIT_ANOTHER_USER_MESSAGE"],
    [50006, "DISCORD_RESPONSE_CANNOT_SEND_AN_EMPTY_MESSAGE"],
    [50007, "DISCORD_RESPONSE_CANNOT_SEND_MESSAGES_TO_THIS_USER"],
    [50008, "DISCORD_RESPONSE_CANNOT_SEND_MESSAGES_IN_A_VOICE_CHANNEL"],
    [50009, "DISCORD_RESPONSE_CHANNEL_VERIFICATION_LEVEL_IS_TOO_HIGH"],
    [50010, "DISCORD_RESPONSE_OAUTH2_APPLICATION_DOES_NOT_HAVE_A_BOT"],
    [50011, "DISCORD_RESPONSE_OAUTH2_APPLICATION_LIMIT_REACHED"],
    [50012, "DISCORD_RESPONSE_INVALID_OAUTH_STATE"],
    [50013, "DISCORD_RESPONSE_MISSING_PERMISSIONS"],
    [50014, "DISCORD_RESPONSE_INVALID_AUTHENTICATION_TOKEN"],
    [50015, "DISCORD_RESPONSE_NOTE_IS_TOO_LONG"],
    [50016, "DISCORD_RESPONSE_MESSAGES_OUT_OF_RANGE."],
    [50019, "DISCORD_RESPONSE_INVALID_PIN_CHANNEL"],
    [50021, "DISCORD_RESPONSE_CANNOT_EXECUTE_ACTION_ON_SYSTEM_MESSAGE"],
    [50034, "DISCORD_RESPONSE_MESSAGE_TOO_OLD_BULK_DELETE"],
    [50035, "DISCORD_RESPONSE_INVALID_FORM_BODY"],
    [50036, "DISCORD_RESPONSE_APPLICATION_NOT_IN_INVITE_GUILD"],
    [50041, "DISCORD_RESPONSE_INVALID_API_VERSION"],
    [90001, "DISCORD_RESPONSE_REACTION_BLOCKED"],
]);

/**
 * Get's the error string for a discord specific Response / Error Code (
 * @param {number} code
 * @returns {string}
 */
function getDiscordResponse(code) {
    var response = discordResponses.get(code);
    if (response) {
        return response;
    }
    return "DISCORD_RESPONSE_UNKNOWN";
}

const discordHTTPResponses = new Map([
    [200, "DISCORD_HTTP_RESPONSE_OK"],
    [201, "DISCORD_HTTP_RESPONSE_CREATED"],
    [204, "DISCORD_HTTP_RESPONSE_NO_CONTENT"],
    [304, "DISCORD_HTTP_RESPONSE_NOT_MODIFIED"],
    [400, "DISCORD_HTTP_RESPONSE_BAD_REQUEST"],
    [401, "DISCORD_HTTP_RESPONSE_UNAUTHORIZED"],
    [403, "DISCORD_HTTP_RESPONSE_FORBIDDEN"],
    [404, "DISCORD_HTTP_RESPONSE_NOT_FOUND"],
    [405, "DISCORD_HTTP_RESPONSE_METHOD_NOT_ALLOWED"],
    [429, "DISCORD_HTTP_RESPONSE_TOO_MANY_REQUESTS"],
    [502, "DISCORD_HTTP_RESPONSE_GATEWAY_UNAVAILABLE"],
]);

/**
 * Get's the error string for a generic HTTP Response / Error Code (
 * @param {number} code
 * @returns {string}
 */
function getDiscordHTTPResponse(code) {
    if (code > 502) {
        return "DISCORD_HTTP_RESPONSE_SERVER_ERROR";
    }
    var response = discordHTTPResponses.get(code);
    if (response) {
        return response;
    }
    return "DISCORD_HTTP_RESPONSE_UNKNOWN";
}

module.exports = exports = {
    message,
    hasCode,
    getDiscordHTTPResponse,
    getDiscordResponse,
    ErisError: makeErisError(Error),
    ErisTypeError: makeErisError(TypeError),
    ErisRangeError: makeErisError(RangeError),
    AssertionError,
    E // This is exported only to facilitate testing.
};