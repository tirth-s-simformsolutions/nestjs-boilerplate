import baseConfig from '../eslint.config.js';

export default [
  ...baseConfig, // inherit everything from root
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname, // replaces __dirname
        project: ['./tsconfig.json'], // local package tsconfig
      },
    },
  },
];
