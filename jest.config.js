// NOTE: tsdx doesn't seem to support loading ts config jest.config.ts
/** @type {import('jest').Config} */
const config = {
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
};

module.exports = config;
