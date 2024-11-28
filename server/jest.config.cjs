module.exports = {
    testEnvironment: 'node',
    testTimeout: 30000,
    verbose: true,
    maxConcurrency: 1,
    transform: {
        '^.+\\.[tj]sx?$': 'babel-jest',
    },
    transformIgnorePatterns: ['/node_modules/'],
    testEnvironment: 'node',
};