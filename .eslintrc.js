module.exports = {
  env: {
    browser: true,
    node: true
  },
  root: true,
  plugins: ['@typescript-eslint', 'react-hooks', 'react'],
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
    'plugin:react-hooks/recommended', // Uses the recommended reach-hooks rules from @eslint-plugin-react-hooks
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
    'prettier',
    'prettier/@typescript-eslint',
  ],
  parserOptions: {
    ecmaVersion: 6, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      modules: true,
      jsx: true, // Allows for the parsing of JSX
    },
  },
  rules: {
    'prefer-promise-reject-errors': 'off',
    'no-prototype-builtins': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/jsx-no-target-blank': 'off',
    'react/prop-types': 'off',
    'react/jsx-no-literals': 'warn',
    'react/jsx-no-useless-fragment': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'off',
    'no-use-before-define': 'off',
    'plugin/no-low-performance-animation-properties': 0,
    "@typescript-eslint/ban-ts-comment": "off"
    // e.g. '@typescript-eslint/explicit-function-return-type': 'off',
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
};
