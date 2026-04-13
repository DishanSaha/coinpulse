import { defineConfig } from 'eslint/config';

const eslintConfig = defineConfig({
  extends: ['next/core-web-vitals', 'next/typescript', 'plugin:prettier/recommended'],
  ignorePatterns: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
});

export default eslintConfig;
