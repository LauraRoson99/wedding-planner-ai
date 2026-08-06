import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // The generated Prisma client and build output are not ours to lint.
  { ignores: ['dist', 'node_modules', 'src/generated', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      // The codebase deliberately uses `(req as any).user` and similar bridges.
      '@typescript-eslint/no-explicit-any': 'off',
      // Unused vars are a warning, not a build-breaking error; ignore `_`-prefixed.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Empty catch blocks are used intentionally for best-effort cleanup.
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
);
