// @ts-nocheck
// Fixes missing TextEncoder and TextDecoder in Jest
// required in nostr-tools nip19 encode / decode functions
const util = require('util');
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;

