module.exports = {
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.svelte$': [
      'svelte-jester',
      {
        compilerOptions: {
          immutable: true,
        },
      },
    ],
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'svelte'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/web_modules/',
    '/docs/',
    '/example/',
    '/lib/',
    '/types/',
  ],

  coverageProvider: 'v8',
  coverageThreshold: {
    global: { branches: 70 },
  },
  collectCoverage: true,
  coverageDirectory: './coverage',
  collectCoverageFrom: ['src/**/*.svelte'],
}
