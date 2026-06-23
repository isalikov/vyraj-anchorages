import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import vue from 'eslint-plugin-vue'

export default [
  {
    ignores: ['dist/**', 'dist-ssr/**', 'coverage/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...vue.configs['flat/recommended'],
  prettier,
  {
    files: ['**/*.{ts,tsx,vue}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/unbound-method': 'off',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'vue/attributes-order': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/require-default-prop': 'off',
      'vue/require-toggle-inside-transition': 'off',
    },
  },
  {
    // All app code must go through the shared API client — no ad-hoc fetch().
    files: ['src/**/*.{ts,vue}'],
    ignores: ['src/api/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="fetch"]',
          message: 'Use src/api/client.ts instead of direct fetch calls.',
        },
      ],
    },
  },
  {
    // The Authorization header carries the raw JWT — never prefix it with "Bearer ".
    files: ['src/**/*.{ts,vue}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/Bearer\\s+/]',
          message: 'Authorization must contain the raw JWT without Bearer.',
        },
        {
          selector: 'TemplateElement[value.raw=/Bearer\\s+/]',
          message: 'Authorization must contain the raw JWT without Bearer.',
        },
      ],
    },
  },
  {
    files: ['*.config.{js,ts}', 'vite.config.ts', 'tests/**/*.{ts,tsx}'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      ...tseslint.configs.disableTypeChecked.languageOptions,
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
  },
]
