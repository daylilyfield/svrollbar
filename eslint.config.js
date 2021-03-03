module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  env: {
    browser: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2015,
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
}
