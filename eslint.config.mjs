import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
      ignores: [
          "**/node_modules/**",
          "**/dist/**",
          "**/*.js",
          "eslint.config.mjs",
      ],
  },
  {
      languageOptions: {
          parser: tseslint.parser,
          parserOptions: {
              project: "./tsconfig.json",
              tsconfigRootDir: import.meta.dirname,
          },
      },
      rules: {
          "@typescript-eslint/explicit-function-return-type": "error",
          "no-useless-catch": "off",
          "no-unused-vars": "off",
          "@typescript-eslint/no-unused-vars": "error",
          "eqeqeq": ["error", "always"],
          "curly": "error",
      },
  }
);
