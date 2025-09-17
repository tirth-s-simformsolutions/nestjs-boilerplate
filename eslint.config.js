import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.config.mjs',
      '**/package.json',
      '**/package-lock.json',
      '**/turbo.json',
      '**/tsconfig*.json',
    ],
  },
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: [
          './tsconfig.base.json', // root
          './apps/*/tsconfig.json', // app-level
          './packages/tsconfig.json', // packages-level
        ],
        tsconfigRootDir: import.meta.dirname,
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
      'no-console': 'warn',
      'no-duplicate-imports': 'error',
      'no-param-reassign': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'prefer-arrow-callback': 'error',
      'prettier/prettier': 'error',
    },
  },
];
