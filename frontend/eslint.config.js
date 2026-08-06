import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // `catch (err: any)` and similar bridges are used throughout; keep as a
      // warning rather than a build-breaking error.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Dev-experience / stylistic rules — surface them but don't fail the build.
      'react-refresh/only-export-components': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
    },
  },
])
