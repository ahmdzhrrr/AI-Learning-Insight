/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    es2022: true,
    node: true
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  }
}