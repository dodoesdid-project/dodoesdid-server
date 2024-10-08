module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'simple-import-sort'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', './src']],
        extensions: ['.ts', '.js'],
      },
    },
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-restricted-imports': [
      'error',
      {
        patterns: ['.*'],
      },
    ],
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          ['^@nestjs/*', '^@prisma/*', '^[a-z]'],
          ['^@/*'],
          ['^@/common/*'],
          ['^@/config/*'],
          ['^@/modules/*'],
          ['^@/utils/*'],
          ['^\\u0000'],
        ],
      },
    ],
    'simple-import-sort/exports': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
};
