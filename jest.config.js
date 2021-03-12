module.exports = {
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.svelte$': 'jest-transform-svelte',
  },
  moduleFileExtensions: ['js', 'svelte'],
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/web_modules/',
    '/docs/',
    '/example/',
    '/lib/',
    '/types/',
  ],
  coverageThreshold: {
    global: { branches: 70 },
  },
  collectCoverage: true,
  coverageDirectory: './coverage',
  collectCoverageFrom: ['src/**/*.svelte'],
}
