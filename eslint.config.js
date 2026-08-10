/**
 * ESLint flat config.
 *
 * Added after a review found two defects that this configuration catches on its
 * own: a hook called inside a conditional (`SectionHeader`) and an effect whose
 * dependency array was spread from a caller-supplied array (`useApi`). The
 * codebase even carried an `eslint-disable` comment that suppressed nothing,
 * because ESLint was never installed.
 *
 * Deliberately narrow: the rules of hooks are correctness, not taste. Stylistic
 * rules are left out — formatting arguments produce noise, and this project has
 * no second author to disagree with.
 */
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Build output, dependencies and the runtime lead store are not source.
    ignores: ['**/dist/**', '**/node_modules/**', 'server/data/**', 'client/public/**']
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    // Server and serverless entry point: Node globals, no DOM.
    files: ['server/**/*.ts', 'api/**/*.ts'],
    languageOptions: {
      globals: globals.node
    }
  },

  {
    // Client: browser globals plus the rules of hooks.
    files: ['client/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      // Errors, not warnings. Both of these describe code that is already broken
      // or one refactor away from breaking — not a preference.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error'
    }
  },

  {
    // Config files run in Node.
    files: ['*.js', 'client/vite.config.ts'],
    languageOptions: {
      globals: globals.node
    }
  },

  {
    rules: {
      // Unused arguments prefixed with `_` are intentional: Express handlers must
      // keep their positional signature even when they ignore an argument (the
      // four-argument error handler is the clearest case).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ]
    }
  }
);
