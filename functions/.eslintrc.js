module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  ignorePatterns: [
    'lib/**/*', // Ignore built files.
    'generated/**/*', // Ignore generated files.
  ],
  rules: {
    // Add any custom rules here
    quotes: ['error', 'double'],
    indent: ['error', 2],
  },
};