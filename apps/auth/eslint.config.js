import baseConfig from '../../eslint.config.js'; // import shared root config

export default [
  ...baseConfig,
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
