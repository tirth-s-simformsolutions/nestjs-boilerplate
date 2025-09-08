const { JestBaseConfig } = require('../jest.config');

module.exports = {
  ...JestBaseConfig,
  rootDir: __dirname,
  testRegex: '.*\\.spec\\.ts$',
  coverageDirectory: '<rootDir>/../../coverage/packages',
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/*.constant.ts',
    '!**/*.interface.ts',
    '!**/*.interceptor.ts',
    '!**/*.dto.ts',
    '!**/main.ts',
    '!**/index.ts',
    '!**/*.config.ts',
    '!database/seed.ts',
    '!database/migrations/**',
    '!**/messages/**',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@core/(.*)$': '<rootDir>/core/$1',
    '^@database/(.*)$': '<rootDir>/database/$1',
    '^@modules/(.*)$': '<rootDir>/modules/$1',
  },
};
