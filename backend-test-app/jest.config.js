module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testEnvironment: 'node',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
      '**/*.ts',
      '!**/*.dto.ts',
      '!**/*.entity.ts',
      '!**/*.guard.ts',
      '!**/*.module.ts',
      '!**/*.strategy.ts',
      '!**/main.ts',
      '!**/seed.ts',
      '!**/support/**',
    ],
  };