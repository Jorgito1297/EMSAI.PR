'use strict';

module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'commonjs',
  },
  rules: {
    // ----- Code quality -----
    'no-console': 'warn',            // Warn on console.* (allowed in config/server bootstrap)
    'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'no-var': 'error',
    'prefer-const': 'error',

    // ----- Node.js safety -----
    'no-process-exit': 'warn',       // Warn on process.exit (allowed in server lifecycle)
    'no-throw-literal': 'error',

    // ----- Formatting (light) -----
    semi: ['error', 'always'],
    quotes: ['error', 'single', { avoidEscape: true }],
    indent: ['error', 2, { SwitchCase: 1 }],
  },
  overrides: [
    {
      // Allow console in server bootstrap and config files
      files: ['src/server.js', 'src/config/database.js'],
      rules: {
        'no-console': 'off',
        'no-process-exit': 'off',
      },
    },
    {
      // Allow console in controllers (error logging)
      files: ['src/controllers/**/*.js'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      // Allow console in app.js (unhandled error logging)
      files: ['src/app.js'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
