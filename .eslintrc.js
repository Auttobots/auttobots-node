module.exports = {
  extends: ['airbnb-base', 'airbnb-typescript/base'],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    project: './tsconfig.json',
  },
  env: {
    browser: false,
    node: true,
    jasmine: false,
  },
  rules: {
    'linebreak-style': 0,
    'no-promise-executor-return': 0,
    'no-empty': [
      'error',
      {
        allowEmptyCatch: true,
      },
    ],
    'max-len': [
      'error',
      {
        code: 80,
      },
    ],
  },
};
