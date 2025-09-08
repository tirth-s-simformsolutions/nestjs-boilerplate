import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['eslint.config.js', 'dist/**', 'jest.config.js'], // replaces ignorePatterns
  },
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/return-await': 'off',
      'no-console': 'warn',
      'no-duplicate-imports': 'error',
      'no-param-reassign': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'prefer-arrow-callback': 'error',
      'prettier/prettier': 'error',
    },
  },
];

// const prettierPlugin = require('eslint-plugin-prettier');
// const globals = require('globals');
// const tseslint = require('typescript-eslint');

// module.exports = [
//   {
//     ignores: ['eslint.config.js', 'dist/**', 'jest.config.js'],
//   },
//   {
//     files: ['**/*.{ts,js}'],
//     languageOptions: {
//       parser: tseslint.parser,
//       parserOptions: {
//         project: ['./tsconfig.json'],
//         tsconfigRootDir: __dirname,
//         sourceType: 'module',
//       },
//       globals: {
//         ...globals.node,
//         ...globals.jest,
//       },
//     },
//     plugins: {
//       '@typescript-eslint': tseslint.plugin,
//       prettier: prettierPlugin,
//     },
//     rules: {
//       ...tseslint.configs.recommended.rules,
//       '@typescript-eslint/no-explicit-any': 'warn',
//       '@typescript-eslint/no-unused-vars': [
//         'error',
//         { argsIgnorePattern: '^_' },
//       ],
//       '@typescript-eslint/no-empty-function': 'error',
//       '@typescript-eslint/return-await': 'off',
//       'no-console': 'warn',
//       'no-duplicate-imports': 'error',
//       'no-param-reassign': 'error',
//       'arrow-body-style': ['error', 'as-needed'],
//       'prefer-arrow-callback': 'error',
//       'prettier/prettier': 'error',
//     },
//   },
// ];
