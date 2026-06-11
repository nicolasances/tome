/** @type {import('jest').Config} */
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.jest.json',
        },
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};

module.exports = config;
