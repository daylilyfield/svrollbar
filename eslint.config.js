module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  parser: '@babel/eslint-parser',
  env: {
    browser: true,
    'jest/globals': true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2017,
  },
  plugins: ['jest'],
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
}
