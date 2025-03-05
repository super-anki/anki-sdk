import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/**/*"],
    rules: {
      "semi": ["error", "never"],
      "comma-dangle": ["error", "always-multiline"],
      "quotes": ["error", "double"],
      "indent": ["error", 2],
      "object-curly-spacing": ["error", "always"],
      "@typescript-eslint/consistent-type-imports": ["error"],
      "@typescript-eslint/no-this-alias": ["off"],
    },
  },
]