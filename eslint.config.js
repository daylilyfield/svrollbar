module.exports = {
  root: true,
  extends: ['eslint:recommended', 'prettier'],
  parser: '@babel/eslint-parser',
  plugins: ['jest', 'svelte3'],
  overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
  env: {
    browser: true,
    'jest/globals': true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2017,
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
}
