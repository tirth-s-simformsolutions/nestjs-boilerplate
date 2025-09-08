const { JestBaseConfig } = require('../../jest.config');

module.exports = {
  ...JestBaseConfig,
  rootDir: __dirname,
  testRegex: '.*\\.spec\\.ts$',
  coverageDirectory: '<rootDir>/../../coverage/auth-service',
  moduleNameMapper: {
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
  },
};
