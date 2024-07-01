module.exports = {
    clearMocks: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./test/prisma/singleton.ts'],
    testMatch: ['**/test/**/*.test.ts'],
    testPathIgnorePatterns: ['/node_modules/'],
  };